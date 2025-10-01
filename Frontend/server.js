require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const winston = require('winston');
const path = require('path');

const app = express();
const PORT = process.env.NODE_PORT || 3000;
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/node.log' })
  ]
});

app.use(cors());
app.use(express.json());

// Serve popup UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..','popup', 'popup.html'));
});

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/popup', express.static(path.join(__dirname, 'popup')));

// Health check
app.get('/health', (req, res) => {
  res.send('Node gateway is running.');
});

// Proxy booking request to Flask
app.post('/spawn-booking', async (req, res) => {
  try {
    logger.info(`Received booking request: ${JSON.stringify(req.body)}`);
    const response = await axios.post(`${FLASK_URL}/book-flight`, req.body);
    logger.info(`Booking confirmed: ${JSON.stringify(response.data)}`);
    res.json(response.data);
  } catch (error) {
    logger.error(`Error communicating with Flask: ${error.message}`);
    res.status(500).json({ error: "Failed to book flight." });
  }
});

// Weather forecast route
app.get('/weather', async (req, res) => {
  const { city } = req.query;
  if (!city || !WEATHER_API_KEY) {
    return res.status(400).json({ error: "Missing city or API key." });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=3&appid=${WEATHER_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    logger.error(`Weather API error: ${error.message}`);
    res.status(500).json({ error: "Failed to fetch weather data." });
  }
});

app.listen(PORT, () => {
  logger.info(`Node server running on port ${PORT}`);
});
