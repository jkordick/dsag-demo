# Weather Dashboard API

A simple Node.js REST API for fetching weather data, perfect for demonstrating GitHub Copilot capabilities in VS Code.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd node
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your OpenWeatherMap API key:
   ```
   WEATHER_API_KEY=your_actual_api_key_here
   PORT=3000
   ```

3. **Start the server:**
   ```bash
   # Development mode (auto-restart on changes)
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Test the API:**
   Open your browser to `http://localhost:3000` or use curl:
   ```bash
   curl http://localhost:3000/api/weather/current/London
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get API Information
```
GET /
```
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Welcome to Weather Dashboard API",
  "version": "1.0.0",
  "endpoints": {
    "GET /health": "Health check endpoint",
    "GET /api/weather/current/:city": "Get current weather for a city",
    "GET /api/weather/forecast/:city": "Get 5-day forecast for a city",
    "GET /api/weather/cities": "Get weather for multiple cities"
  }
}
```

#### 2. Health Check
```
GET /health
```
Health check endpoint for monitoring API availability and external dependencies.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-26T13:10:07.163Z",
  "responseTime": "19ms",
  "services": {
    "server": {
      "status": "healthy"
    },
    "weatherApi": {
      "status": "healthy",
      "error": null
    }
  }
}
```

**Status Values:**
- `healthy`: All services are functioning normally
- `degraded`: Server is running but external dependencies have issues
- `unhealthy`: External service is not accessible

**Example Request:**
```bash
curl http://localhost:3000/health
```

#### 3. Current Weather
```
GET /api/weather/current/:city
```
Get current weather for a specific city.

**Parameters:**
- `city` (string): City name (e.g., "London", "New York")

**Example Request:**
```bash
curl http://localhost:3000/api/weather/current/London
```

**Example Response:**
```json
{
  "city": "London",
  "country": "GB",
  "temperature": {
    "current": 15,
    "feels_like": 14,
    "min": 12,
    "max": 18
  },
  "weather": {
    "main": "Clouds",
    "description": "broken clouds",
    "icon": "04d"
  },
  "humidity": 72,
  "pressure": 1013,
  "wind": {
    "speed": 3.6,
    "direction": 250
  },
  "timestamp": "2025-08-26T10:30:00.000Z"
}
```

#### 4. Weather Forecast
```
GET /api/weather/forecast/:city
```
Get 5-day weather forecast for a specific city.

**Parameters:**
- `city` (string): City name

**Example Request:**
```bash
curl http://localhost:3000/api/weather/forecast/Paris
```

#### 5. Multiple Cities Weather
```
POST /api/weather/cities
```
Get current weather for multiple cities (up to 10).

**Request Body:**
```json
{
  "cities": ["London", "Paris", "Tokyo", "New York"]
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/weather/cities \
  -H "Content-Type: application/json" \
  -d '{"cities": ["London", "Paris", "Tokyo"]}'
```

## 🛠️ Development

### Project Structure
```
node/
├── server.js              # Main server file
├── routes/
│   └── weather.js         # Weather API routes
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # This file
```

### Scripts
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with auto-restart
- `npm test` - Run tests (not implemented yet)

### Environment Variables
- `WEATHER_API_KEY` - Your OpenWeatherMap API key (required)
- `PORT` - Server port (optional, defaults to 3000)

## 🔧 GitHub Copilot Demo Features

This project is designed to showcase GitHub Copilot's capabilities:

1. **API Route Generation**: Copilot can help generate Express.js routes and middleware
2. **Error Handling**: Comprehensive error handling patterns
3. **Input Validation**: City name validation and request validation
4. **API Integration**: External API calls with axios
5. **Documentation**: Auto-generation of API documentation
6. **Testing**: Structure ready for test implementation

### Try These Copilot Prompts:
- "Add rate limiting middleware"
- "Create a health check endpoint"
- "Add caching for weather data"
- "Write unit tests for the weather routes"
- "Add logging with Winston"
- "Create a Docker configuration"

## 🌡️ Weather Data Source

This API uses the [OpenWeatherMap API](https://openweathermap.org/) which provides:
- Current weather data
- 5-day weather forecasts
- Weather data for 200,000+ cities worldwide
- Free tier with 1,000 API calls per day

## 📋 Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid city names or request format
- **404 Not Found**: City not found in weather database
- **500 Internal Server Error**: API configuration issues or service unavailable

## 🔒 Security Features

- Input validation for city names
- Environment variable protection
- CORS enabled for cross-origin requests
- Request logging for monitoring

## 🚧 Future Enhancements

Potential improvements to showcase more Copilot features:
- [ ] Redis caching for weather data
- [ ] Rate limiting with express-rate-limit
- [ ] Weather alerts and notifications
- [ ] Historical weather data endpoints
- [ ] GraphQL implementation
- [ ] WebSocket for real-time updates
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

## 📝 License

ISC License - feel free to use this project for learning and demonstration purposes.