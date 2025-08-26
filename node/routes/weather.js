const express = require('express');
const axios = require('axios');
const router = express.Router();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Debug endpoint to check environment variables
router.get('/debug', (req, res) => {
  res.json({
    hasApiKey: !!WEATHER_API_KEY,
    apiKeyLength: WEATHER_API_KEY ? WEATHER_API_KEY.length : 0,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('WEATHER'))
  });
});

// Utility function to validate city name
const validateCity = (city) => {
  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    return false;
  }
  // Basic validation: only letters, spaces, and common city name characters
  return /^[a-zA-Z\s\-\.,']+$/.test(city.trim());
};

// Utility function to format weather response
const formatWeatherData = (data) => {
  return {
    city: data.name,
    country: data.sys.country,
    temperature: {
      current: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      min: Math.round(data.main.temp_min),
      max: Math.round(data.main.temp_max)
    },
    weather: {
      main: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    },
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    wind: {
      speed: data.wind.speed,
      direction: data.wind.deg
    },
    timestamp: new Date().toISOString()
  };
};

// GET /api/weather/current/:city - Get current weather for a city
router.get('/current/:city', async (req, res) => {
  try {
    const { city } = req.params;
    // Validate city parameter
    if (!validateCity(city)) {
      return res.status(400).json({
        error: 'Invalid city name',
        message: 'City name must contain only letters, spaces, and common punctuation'
      });
    }

    // Check if API key is configured
    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Weather API key not configured. Please set WEATHER_API_KEY environment variable.'
      });
    }

    // Fetch weather data from OpenWeatherMap
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        q: city.trim(),
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const weatherData = formatWeatherData(response.data);
    res.json(weatherData);

  } catch (error) {
    console.error('Weather API Error:', error.message);
    
    if (error.response) {
      // API returned an error
      if (error.response.status === 404) {
        return res.status(404).json({
          error: 'City not found',
          message: `Weather data for '${req.params.city}' could not be found`
        });
      }
      if (error.response.status === 401) {
        return res.status(500).json({
          error: 'API authentication failed',
          message: 'Invalid weather API key'
        });
      }
    }
    
    res.status(500).json({
      error: 'Weather service unavailable',
      message: 'Failed to fetch weather data. Please try again later.'
    });
  }
});

// GET /api/weather/forecast/:city - Get 5-day forecast for a city
router.get('/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!validateCity(city)) {
      return res.status(400).json({
        error: 'Invalid city name',
        message: 'City name must contain only letters, spaces, and common punctuation'
      });
    }

    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Weather API key not configured'
      });
    }

    const response = await axios.get(`${WEATHER_BASE_URL}/forecast`, {
      params: {
        q: city.trim(),
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const forecastData = {
      city: response.data.city.name,
      country: response.data.city.country,
      forecast: response.data.list.slice(0, 5).map(item => ({
        datetime: item.dt_txt,
        temperature: {
          current: Math.round(item.main.temp),
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max)
        },
        weather: {
          main: item.weather[0].main,
          description: item.weather[0].description,
          icon: item.weather[0].icon
        },
        humidity: item.main.humidity,
        wind_speed: item.wind.speed
      }))
    };

    res.json(forecastData);

  } catch (error) {
    console.error('Forecast API Error:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'City not found',
        message: `Forecast data for '${req.params.city}' could not be found`
      });
    }
    
    res.status(500).json({
      error: 'Forecast service unavailable',
      message: 'Failed to fetch forecast data'
    });
  }
});

// POST /api/weather/cities - Get weather for multiple cities
router.post('/cities', async (req, res) => {
  try {
    const { cities } = req.body;
    
    if (!Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Please provide an array of city names'
      });
    }

    if (cities.length > 10) {
      return res.status(400).json({
        error: 'Too many cities',
        message: 'Maximum 10 cities allowed per request'
      });
    }

    if (!WEATHER_API_KEY) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Weather API key not configured'
      });
    }

    // Validate all cities
    const invalidCities = cities.filter(city => !validateCity(city));
    if (invalidCities.length > 0) {
      return res.status(400).json({
        error: 'Invalid city names',
        message: `Invalid cities: ${invalidCities.join(', ')}`
      });
    }

    // Fetch weather for all cities in parallel
    const weatherPromises = cities.map(async (city) => {
      try {
        const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
          params: {
            q: city.trim(),
            appid: WEATHER_API_KEY,
            units: 'metric'
          }
        });
        return { city, data: formatWeatherData(response.data), error: null };
      } catch (error) {
        return { 
          city, 
          data: null, 
          error: error.response?.status === 404 ? 'City not found' : 'Service unavailable'
        };
      }
    });

    const results = await Promise.all(weatherPromises);
    
    const response = {
      total: cities.length,
      successful: results.filter(r => r.data !== null).length,
      results: results
    };

    res.json(response);

  } catch (error) {
    console.error('Multiple cities API Error:', error.message);
    res.status(500).json({
      error: 'Service error',
      message: 'Failed to fetch weather data for cities'
    });
  }
});

module.exports = router;