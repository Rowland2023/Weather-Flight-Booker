require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const winston = require('winston');

const app = express();
const PORT = process.env.NODE_PORT || 3000;
const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5000';

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

app.listen(PORT, () => {
  logger.info(`Node server running on port ${PORT}`);
});
