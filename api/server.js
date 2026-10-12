/**
 * server.js
 * ------------------------------------------------------------
 * Main Express server for the Charity Events website API.
 *
 * Usage:
 *   1. npm install
 *   2. Make sure MySQL is running and charityevents_db exists
 *   3. node server.js
 *
 * API runs on http://localhost:3000
 * ------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const https = require('https');
const { testConnection } = require('./event_db');
const eventsRouter = require('./routes/events');
const categoriesRouter = require('./routes/categories');
const registrationsRouter = require('./routes/registrations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware — these run for EVERY incoming request, in order.
// Order matters: cors() and express.json() must come before the routes,
// otherwise the routes would never see the parsed request body.
app.use(cors());                       // allow cross-origin from frontend
app.use(express.json());               // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/registrations', registrationsRouter);

// ------------------------------------------------------------
// BONUS: Weather API proxy (Open-Meteo, free, no API key needed)
// GET /api/weather?latitude=-27.96&longitude=153.41
// Returns current temperature + weather code for the event location.
// We proxy from the server so the frontend doesn't need to handle CORS.
// ------------------------------------------------------------
app.get('/api/weather', (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'latitude and longitude are required' });
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`;

  https.get(url, (weatherRes) => {
    let data = '';
    weatherRes.on('data', (chunk) => data += chunk);
    weatherRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const current = parsed.current || {};
        // Map Open-Meteo weather_code to a human label
        const code = current.weather_code ?? 0;
        const labelMap = {
          0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
          45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
          61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow',
          75: 'Heavy snow', 80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
          95: 'Thunderstorm'
        };
        res.status(200).json({
          success: true,
          temperature_c: current.temperature_2m,
          weather_code: code,
          weather_label: labelMap[code] || 'Unknown',
          observed_at: current.time
        });
      } catch (e) {
        res.status(502).json({ success: false, message: 'Failed to parse weather data' });
      }
    });
  }).on('error', (err) => {
    console.error('Weather API error:', err.message);
    res.status(502).json({ success: false, message: 'Weather service unavailable' });
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Charity Events API is running (Team 18 A3)',
    endpoints: [
      'GET /api/events',
      'GET /api/events/search?date=&location=&category_id=',
      'GET /api/events/:id',
      'GET /api/events/all',
      'GET /api/categories',
      'POST /api/events',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'POST /api/registrations',
      'GET /api/registrations?event_id=',
      'GET /api/weather?latitude=&longitude='
    ]
  });
});

// 404 handler for undefined API routes.
// Mounted under /api AFTER all real routes: Express matches top-to-bottom,
// so any /api/* request that no route handled lands here with a clean 404
// JSON response instead of a confusing HTML "Cannot GET" page.
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Start server
async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`[Server] Charity Events API running on http://localhost:${PORT}`);
  });
}

startServer();
