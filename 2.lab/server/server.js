const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require('dotenv').config();

//Inicijalizacija aplikacije
const app = express();
const PORT = 8080;
const sessions = {};
const loginAttempts = {};

//Middleware za CORS, parsiranje URL i JSON tijela zahtjeva
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Povezivanje na bazu podataka
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: true,
});

//Provjera povezanosti s bazom podataka
pool.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch(err => console.error("Connection error", err.stack));

/**
 * Endpoint za prijavu korisnika  
 * 
 * @route POST /login
 * @param {Object} req - Zahtjev koji sadrzi:
 * @param {string} req.body.email - Email adresa korisnika za autentifikaciju
 * @param {string} req.body.password - Lozinka korisnika za autentifikaciju
 * @param {boolean} req.body.sqlInjectionCheckbox - Zastavica koja oznacava je li omogucen SQL injection
 * @param {Object} res - Odgovor koji salje HTTP odgovor
 * 
 * @description
 * Obraduje se prijava korisnika provjerom unesene email adrese i lozinke. Ako je "sqlInjectionCheckbox"
 * postavljen na true, koristi se ranjiv upit za testiranje SQL injectiona.
 * Ako nije postavljen, koriste se parametarski upiti i sanitizacija korisnickog unosa za ocuvanje sigurnosti.
 * 
 * @returns {Object} 200 - Uspjesna prijava s podacima o korisniku
 * @returns {Object} 400 - Neispravan unos
 * @returns {Object} 401 - Neuspjesna prijava, neispravna email adresa ili lozinka
 * @returns {Object} 500 - Greska na serveru
 */
app.post('/login', async (req, res) => {
  const { email, password, sqlInjectionCheckbox } = req.body;

  // console.log('Email:', email);
  // console.log('Password:', password);
  // console.log('SQL Injection Testing:', sqlInjectionCheckbox);

  let query;
  if (sqlInjectionCheckbox) {
    //nesiguran, neparametrizirani upit
    query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;
  } else {
    //sanitizacija unosa
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    //parametrizirani upit
    query = `SELECT * FROM users WHERE email = $1 AND password = $2;`;
  }

  // console.log("Executing query:", query);

  try {
    const result = sqlInjectionCheckbox
      ? await pool.query(query)
      : await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.status(200).json({ message: `Login successful for user ${user.email}`, user });
      // console.log("Login successful!");
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
      // console.log("Invalid email or password.");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Endpoint za pretragu korisnika na temelju unesenog pojma
 * 
 * @route GET /search
 * @param {Object} req - Zahtjev koji sadrzi:
 * @param {string} req.query.term - Pojam za pretragu, npr ime ili email korisnika
 * @param {boolean} req.query.sqlInjectionCheckbox - Zastavica koja oznacava je li omogucen SQL injection
 * @param {Object} res - Odgovor koji salje HTTP odgovor
 * 
 * @description
 * Pretraga korisnika na temelju unesenog pojma (ime ili email adresa). Ako je "sqlInjectionCheckbox"
 * postavljen na true, koristi se ranjiv upit koji izravno ukljucuje korisnicke podatke za testiranje SQL injectiona.
 * Ako nije postavljen, koriste se parametarski upiti i sanitizacija unosa kako bi se onemogucio SQL injection.
 *
 * @returns {Array<Object>} 200 - Rezultati pretrage
 * @returns {Object} 400 - Neispravan unos
 * @returns {Object} 404 - Nema rezultata za pretragu
 * @returns {Object} 500 - Greska na serveru
 */
app.get('/search', async (req, res) => {
  const { term, sqlInjectionCheckbox } = req.query;

  // console.log('Search Term:', term);
  // console.log('SQL Injection Testing:', sqlInjectionCheckbox);

  let query;
  let queryParams = [];

  if (sqlInjectionCheckbox === 'true') {
    //nesigurno
    query = `SELECT * FROM users WHERE name LIKE '%${term}%' OR email LIKE '%${term}%'`;
  } else {
    //sanitizacija
    const sanitizedTerm = term.replace(/[^a-zA-Z0-9\s]/g, '');
    const suspiciousPatterns = /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bDROP\b|\b--\b)/i;
    if (suspiciousPatterns.test(sanitizedTerm)) {
      return res.status(400).json({ message: 'Invalid input: Possible SQL injection attempt detected' });
    }
    //parametrizacija
    query = `SELECT * FROM users WHERE name ILIKE $1 OR email ILIKE $1`;
    queryParams = [`%${sanitizedTerm}%`];
  }

  // console.log("Executing query:", query);

  try {
    const result = await pool.query(query, queryParams);
    if (result.rows.length > 0) {
      res.status(200).json(result.rows);
    } else {
      res.status(404).json({ message: 'No terms found' });
    }
  } catch (err) {
    console.error("Error executing query:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Endpoint za promjenu lozinke korisnika
 * 
 * @route POST /changePassword
 * @param {Object} req - Zahtjev koji sadrzi:
 * @param {string} req.body.email - Email korisnika cija se lozinka mijenja
 * @param {string} req.body.currentPassword - Trenutna lozinka korisnika koju treba potvrditi
 * @param {string} req.body.newPassword - Nova lozinka koja ce zamijeniti trenutnu
 * @param {boolean} req.body.sqlInjectionCheckbox - Zastavica koja oznacava je li omogucen SQL injection
 * @param {Object} res - Odgovor za slanje HTTP odgovora
 *
 * @description
 * Promjena lozinke korisnika. Ako je "sqlInjectionCheckbox"
 * postavljen na true, koristi se ranjiv upit za autentifikaciju i promjenu lozinke
 * Ako nije postavljen, koriste se parametarski upiti i zastita lozinke kako bi se onemogucio SQL injection
 *
 * @returns {Object} 200 - Uspjesna promjena lozinke
 * @returns {Object} 403 - Neispravna trenutna lozinka
 * @returns {Object} 404 - Korisnik ne postoji
 * @returns {Object} 500 - Greska na serveru
 */
app.post('/changePassword', async (req, res) => {
  const { email, currentPassword, newPassword, sqlInjectionCheckbox } = req.body;
  // console.log('Received data:', req.body);

  try {
    let result;
    if (sqlInjectionCheckbox) {
      //nesigurno
      result = await pool.query(`SELECT password FROM users WHERE email = '${email}';`);
    } else {
      //parametrizacija
      result = await pool.query('SELECT password FROM users WHERE email = $1;', [email]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const storedPassword = result.rows[0].password;

    let isPasswordValid = false;

    if (sqlInjectionCheckbox) {
      //nesigurno
      const vulnerablePasswordCheckQuery = `SELECT password FROM users WHERE email = '${email}' AND password = '${currentPassword}';`;
      const vulnerableResult = await pool.query(vulnerablePasswordCheckQuery);

      // console.log(vulnerableResult);
      isPasswordValid = vulnerableResult.rows.length > 0;
    } else {
      //nije ni ovo najsigurnije jer su lozinke postavljene u bazu u plain textu
      isPasswordValid = (currentPassword === storedPassword);
    }

    if (!isPasswordValid) {
      return res.status(403).json({ error: 'Current password is incorrect' });
    }

    let query;
    if (sqlInjectionCheckbox) {
      //nesigurno
      query = `UPDATE users SET password = '${newPassword}' WHERE email = '${email}';`;
      await pool.query(query);
    } else {
      //parametrizacija
      query = `UPDATE users SET password = $1 WHERE email = $2;`;
      await pool.query(query, [newPassword, email]);
    }

    // console.log("Executing change password query:", query);
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Endpoint za prijavu korisnika uz losu autentifikaciju
 *
 * @route POST /loginBrokenAuth
 * @param {Object} req - Zahtjev koji sadrzi:
 * @param {string} req.body.email - Email korisnika koji se prijavljuje
 * @param {string} req.body.password - Lozinka korisnika koja se koristi za prijavu
 * @param {boolean} req.body.brokenAuthCheckbox - Zastavica koja oznacava je li omogucena losa autentifikacija ili ne
 * 
 * @description
 * Prijava s dvije vrste autentifikacije, losom i sigurnom autentifikacijom. Ovisno o vrijednosti "brokenAuthCheckbox"
 * odabire se izmedu sigurnog i nesigurnog upita. Nesigurni upit ne koristi parametrizirane upite te je podlozan brute force napadima.
 * Sigurna autentifikacija koristi parametrizirane upite, sigurnu provjeru lozinki te otezavanje brute force napada implementacijom vremenske zastite prijave korisnika
 * 
 * @returns {Object} 200 - Uspjesna prijava
 * @returns {Object} 401 - Neispravni podaci za prijavu
 * @returns {Object} 429 - Previse pokusaja prijave
 * @returns {Object} 500 - Greska na serveru
 */
app.post('/loginBrokenAuth', async (req, res) => {
  const { email, password, brokenAuthCheckbox } = req.body;
  const ip = req.ip;

  // console.log('Received login request:');
  // console.log(`Email: ${email}`);
  // console.log(`Password: ${password}`);
  // console.log(`Broken Auth Checkbox: ${brokenAuthCheckbox}`);

  if (brokenAuthCheckbox) {
    //nesigurno
    const insecureQuery = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}';`;
    // console.log('Executing insecure query:', insecureQuery);
    try {
      const result = await pool.query(insecureQuery);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      //md5 za kriptiranje session identifikatora
      const sessionId = crypto.createHash("md5").update(email + Date.now()).digest("hex");
      sessions[sessionId] = email;
      res.json({ message: "Login successful with broken auth", sessionId });
    } catch (err) {
      // console.error('Error executing insecure query:', err);
      res.status(500).json({ error: 'Server error' });
    }

  } else {
    //provjera broja prijava korisnika
    if (loginAttempts[ip] && loginAttempts[ip].count >= 3 && Date.now() < loginAttempts[ip].expires) {
      return res.status(429).json({ message: "Too many attempts. Try again after 30 seconds." });
    }
    //parametrizirani upit
    const secureQuery = `SELECT * FROM users WHERE email = $1;`;
    // console.log('Executing secure query:', secureQuery);

    try {
      const result = await pool.query(secureQuery, [email]);
      if (result.rows.length === 0) {
        loginAttempts[ip] = loginAttempts[ip] || { count: 0 };
        loginAttempts[ip].count += 1;
        //30s blokada
        if (loginAttempts[ip].count >= 3) {
          loginAttempts[ip].expires = Date.now() + 30 * 1000;
        }
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const user = result.rows[0];
      //lozinka za ovog korisnika je spremljena u hash formatu, a ne u plain textu kao drugi korisnici
      const passwordMatches = await bcrypt.compare(password, user.password);

      if (!passwordMatches) {
        loginAttempts[ip] = loginAttempts[ip] || { count: 0 };
        loginAttempts[ip].count += 1;

        if (loginAttempts[ip].count >= 3) {
          loginAttempts[ip].expires = Date.now() + 30 * 1000;
        }
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      loginAttempts[ip] = { count: 0 };
      const sessionId = crypto.randomBytes(64).toString("hex");
      sessions[sessionId] = { email, expires: Date.now() + 24 * 60 * 60 * 1000 };
      res.cookie("sessionId", sessionId, { httpOnly: true, secure: true });
      res.json({ message: "Login successful with secure auth" });
    } catch (err) {
      console.error('Error executing secure query:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

//Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});