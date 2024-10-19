/**
 * Uvoz potrebnih modula i biblioteka
 */
const router = require('express').Router();
const { requiresAuth } = require('express-openid-connect');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const request = require('request');

/**
 * @route GET /
 * @description Prikaz pocetne stranice
 * @param {Object} req - Express objekt za zahtjev
 * @param {Object} res - Express objekt za odgovor
 * @param {function} next - Funkcija za daljnju obradu
 */
router.get('/', function (req, res, next) {
  res.render('index', {
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

/**
 * @route GET /create-ticket
 * @description Prikaz stranice za kreiranje karte
 * @param {Object} req - Express objekt za zahtjev
 * @param {Object} res - Express objekt za odgovor
 */
router.get('/create-ticket', (req, res) => {
  res.render('create-ticket', {
    title: 'Create Ticket',
  });
});

/**
 * @function getAccessToken
 * @description Dobiva pristupni token za autentifikaciju
 * @returns {Promise<string>} Pristupni token
 */
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      url: 'https://dev-azim8sfu2yz6kzyp.us.auth0.com/oauth/token',
      headers: { 'content-type': 'application/json' },
      body: `{"client_id":"${process.env.AUTH0_CLIENT_ID}","client_secret":"${process.env.AUTH0_CLIENT_SECRET}","audience":"${process.env.AUTH0_AUDIENCE}","grant_type":"client_credentials"}`
    };

    // console.log(options); //debug

    request(options, (error, response, body) => {
      if (error) {
        console.error('Error fetching access token:', error);
        return reject(error);
      }

      const parsedBody = JSON.parse(body);
      if (response.statusCode !== 200) {
        console.error('Error fetching access token:', parsedBody);
        return reject(new Error(parsedBody.error_description || 'Error fetching access token:'));
      }

      console.log('Access token fetched successfully:', parsedBody.access_token); 
      resolve(parsedBody.access_token);
    });
  });
};

/**
 * @route POST /create-ticket
 * @description Kreira novu kartu na temelju podataka poslanih u zahtjevu
 * @param {Object} req - Express objekt za zahtjev
 * @param {Object} res - Express objekt za odgovor
 */
router.post('/create-ticket', async (req, res) => {
  const { vatin, first_name, last_name } = req.body; 

  if (!vatin || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields: vatin, first_name, last_name' });
  }

  try {
    const accessToken = await getAccessToken();
    console.log('Pristupni token:', accessToken);

    const result = await req.pool.query(
      'SELECT COUNT(*) AS ticketCount FROM tickets WHERE vatin = $1',
      [vatin]
    );

    const ticketCount = parseInt(result.rows[0].ticketcount);

    if (ticketCount >= 3) {
      return res.status(400).json({ error: 'Maximum of 3 tickets already created for this OIB.' });
    }

    const ticketId = uuidv4();
    const createdAt = new Date();

    await req.pool.query(
      'INSERT INTO tickets (id, vatin, first_name, last_name, created_at) VALUES ($1, $2, $3, $4, $5)',
      [ticketId, vatin, first_name, last_name, createdAt]
    );

    const ticketURL = `${process.env.BASE_URL}/ticket/${ticketId}`; 
    const qrCodeImage = await QRCode.toDataURL(ticketURL);

    res.json({ qrCode: qrCodeImage, ticketURL }); 
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * @route GET /ticket-confirmation
 * @description Prikazuje stranicu za potvrdu karte s QR kodom
 * @param {Object} req - Express objekt za zahtjev
 * @param {Object} res - Express objekt za odgovor
 */
router.get('/ticket-confirmation', (req, res) => {
  const qrCode = req.query.qrCode;
  res.render('ticketConfirmation', { qrCode });
});

/**
 * @route GET /ticket/:id
 * @description Prikazuje detalje karte
 * @param {Object} req - Express objekt za zahtjev
 * @param {Object} res - Express objekt za odgovor
 */
router.get('/ticket/:id', requiresAuth(), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await req.pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    const userEmail = req.oidc.user.email;
    const ticket = result.rows[0];
    const ticketURL = `${process.env.BASE_URL}/ticket/${ticket.id}`;
    const qrCodeImage = await QRCode.toDataURL(ticketURL);

    res.render('ticketDetails', { ticket, qrCodeImage, userEmail });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;