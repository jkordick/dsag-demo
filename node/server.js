// Load environment variables FIRST
require('dotenv').config();

// Debug: Log environment variables
console.log('🔧 Environment variables loaded:');
console.log('WEATHER_API_KEY:', process.env.WEATHER_API_KEY ? `${process.env.WEATHER_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log('PORT:', process.env.PORT);

const express = require('express');
const cors = require('cors');
const axios = require('axios');
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
      'GET /health': 'Health check endpoint',
      'GET /api/weather/current/:city': 'Get current weather for a city',
      'GET /api/weather/forecast/:city': 'Get 5-day forecast for a city',
      'GET /api/weather/cities': 'Get weather for multiple cities'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Server is running if we can respond
  const serverStatus = 'healthy';
  
  // Test OpenWeatherMap API connectivity
  let weatherApiStatus = 'healthy';
  let weatherApiError = null;
  let responseTime = 0;
  
  try {
    const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
    
    if (!WEATHER_API_KEY) {
      weatherApiStatus = 'degraded';
      weatherApiError = 'API key not configured';
    } else {
      // Test with a simple weather call to London
      const testResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          q: 'London',
          appid: WEATHER_API_KEY,
          units: 'metric'
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (testResponse.status === 200) {
        weatherApiStatus = 'healthy';
      }
    }
  } catch (error) {
    weatherApiStatus = 'unhealthy';
    if (error.response) {
      weatherApiError = `API error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.code === 'ECONNABORTED') {
      weatherApiError = 'API timeout';
    } else {
      weatherApiError = 'API connection failed';
    }
  }
  
  responseTime = Date.now() - startTime;
  
  // Always return 200 if server is running, but include service status details
  const overallStatus = weatherApiStatus === 'healthy' ? 'healthy' : 'degraded';
  
  res.status(200).json({
    status: overallStatus,
    timestamp: timestamp,
    responseTime: `${responseTime}ms`,
    services: {
      server: {
        status: serverStatus
      },
      weatherApi: {
        status: weatherApiStatus,
        error: weatherApiError
      }
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