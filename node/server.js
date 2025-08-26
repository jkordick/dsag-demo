// Load environment variables FIRST
require('dotenv').config();

// Debug: Log environment variables
console.log('🔧 Environment variables loaded:');
console.log('WEATHER_API_KEY:', process.env.WEATHER_API_KEY ? `${process.env.WEATHER_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('PORT:', process.env.PORT);

const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/weather', weatherRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Weather Dashboard API',
    version: '1.0.0',
    endpoints: {
      'GET /api/weather/current/:city': 'Get current weather for a city',
      'GET /api/weather/forecast/:city': 'Get 5-day forecast for a city',
      'GET /api/weather/cities': 'Get weather for multiple cities'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Dashboard API is running on port ${PORT}`);
  console.log(`📖 API documentation available at http://localhost:${PORT}`);
});

module.exports = app;