/**
 * Uvoz potrebnih modula i biblioteka
 */
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');
const { Pool } = require('pg');

/*
* Ucitavanje varijabli okruzenja iz .env datoteke
*/
dotenv.config();

/**
 * Kreiranje Express aplikacije.
 */
const app = express();

/**
 * Postavljanje putanje za view direktorij
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/**
 * 
 * Konfiguracija middleware-a koja obuhvaca ukljucivanje loggera za razvoj, ukljucivanje JSON parsera i Ukljucivanje URL-encoded parsera
 */
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Konfiguracija za autentifikaciju
 */
const config = {
  authRequired: false,
  auth0Logout: true, 
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

/**
 * Ukljucivanje middleware-a za autentifikaciju
 */
app.use(auth(config));

/**
 * Middleware za postavljanje korisnickih informacija u lokalne varijable odgovora
 */
app.use((req, res, next) => {
  res.locals.user = req.oidc.user;
  res.locals.isAuthenticated = req.oidc.isAuthenticated();
  next();
});

/**
 * Definiranje porta na kojem aplikacija slusa
 */
const port = process.env.PORT || 8080;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

/**
 * Inicijalizacija PostgreSQL connection pool-a
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT, 
  ssl: true,
});

/**
 * Middleware za dodavanje konekcije na bazu podataka u zahtjev
 */
app.use((req, res, next) => {
  req.pool = pool; 
  next();
});

/**
 * Definiranje GET rute za pocetnu stranicu.
 */
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS ticketCount FROM tickets');
    const ticketCount = result.rows[0].ticketcount;

    // Renderiranje pocetne stranice s brojem karata
    res.render('index', {
      title: 'Ticket System', 
      ticketCount: ticketCount
    });
  } catch (error) {
    console.error('No tickets:', error); 

    const ticketCount = 0; 

    res.render('index', {
      title: 'Ticket System',
      ticketCount: ticketCount 
    });
  }
});
/**
 * Koristenje routera za sve ostale rute
 */
app.use('/', router);

/**
 * Middleware za rukovanje error 404
 */
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404; 
  next(err);
});

/**
 * Middleware za ostale errore.
 */
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

/**
 * Kreiranje i pokretanje servera
 */
http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });
