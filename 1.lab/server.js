const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');
const { Pool } = require('pg');

dotenv.config();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

app.use(auth(config));

app.use((req, res, next) => {
  res.locals.user = req.oidc.user;
  res.locals.isAuthenticated = req.oidc.isAuthenticated();
  next();
});

const port = process.env.PORT || 8080;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

app.use((req, res, next) => {
  req.pool = pool;
  next();
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) AS ticketCount FROM tickets');
    const ticketCount = result.rows[0].ticketcount;

    res.render('index', {
      title: 'Ticket System',
      ticketCount: ticketCount
    });
  } catch (error) {
    console.error('Zero tickets:', error);
    
    const ticketCount = 0;

    res.render('index', {
      title: 'Ticket System',
      ticketCount: ticketCount
    });
  }
});


app.use('/', router);

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });
