# Country Currency and Exchange API

A robust REST API built with **Express.js** and **TypeScript** that provides comprehensive country information, currency data, and exchange rate management. The API fetches data from external sources, stores it in a MySQL database using **Prisma ORM**, and offers efficient querying, filtering, and visualization capabilities.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
- [Request Examples](#request-examples)
- [Response Examples](#response-examples)
- [Error Handling](#error-handling)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

---

## Features

- 🌍 **Country Data Management**: Fetch and manage country information including capital, region, population, and flag URLs
- 💱 **Exchange Rate Integration**: Real-time currency exchange rates with estimated GDP calculations
- 📊 **Data Visualization**: Auto-generate PNG summary images with top countries by estimated GDP
- 🔄 **Data Refresh**: Manually trigger data refresh from external APIs (REST Countries, ER-API)
- 🗄️ **Database Persistence**: MySQL database with Prisma ORM for reliable data storage
- ⚡ **Rate Limiting**: Built-in rate limiting to prevent API abuse
- 📝 **Comprehensive Logging**: Request logging middleware for monitoring
- ✅ **TypeScript**: Full type safety and better development experience
- 🛡️ **Error Handling**: Centralized error handling with meaningful error messages
- 🔍 **Advanced Filtering**: Query countries by region, currency, and sort by GDP

---

## Architecture

### High-Level Overview

```bash
┌─────────────────────────────────────────────────────┐
│           Client / Frontend Application             │
└──────────────────────────────┬──────────────────────┘
                               │ HTTP Requests
                               ▼
┌─────────────────────────────────────────────────────┐
│          Express.js REST API Server (Port 3000)    │
│  ┌────────────────────────────────────────────────┐ │
│  │  Rate Limiting Middleware                      │ │
│  │  Logging Middleware                            │ │
│  │  Error Handling Middleware                     │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Route Handlers (countryRoute.ts)              │ │
│  │  ├─ POST /countries/refresh                    │ │
│  │  ├─ GET /countries                             │ │
│  │  ├─ GET /countries/:name                       │ │
│  │  ├─ GET /countries/image                       │ │
│  │  ├─ DELETE /countries/:name                    │ │
│  │  └─ GET /status                                │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │  Service Layer                                 │ │
│  │  ├─ countryService (business logic)            │ │
│  │  └─ imageService (image generation)            │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────┬───────────────┘
                   │                  │
         ┌─────────▼────────┐  ┌──────▼─────────┐
         │  MySQL Database  │  │  External APIs │
         │  (via Prisma)    │  │  ├─ REST Ctrs  │
         │  ├─ Country      │  │  └─ ER-API     │
         │  └─ Metadata     │  └────────────────┘
         └──────────────────┘
```

### Layered Design

1. **Controllers** (`src/controllers/`): Handle HTTP requests/responses
2. **Services** (`src/services/`): Business logic and data processing
3. **Database** (`prisma/`): ORM schema and migrations
4. **Middlewares** (`src/middlewares/`): Cross-cutting concerns (logging, errors)
5. **Utils** (`src/utils/`): Utilities (rate limiting, API error class)
6. **Routes** (`src/routes/`): Endpoint definitions

---

## Prerequisites

- **Node.js** 16+ and **npm** 7+
- **MySQL** 8.0+ running locally or remote server
- **Prisma CLI** (installed via npm)

---

## Installation & Setup

### Step 1: Clone/Download the Repository

```bash
cd "path/to/stage 2 country currency and exchange api"
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:

- `express`: Web framework
- `axios`: HTTP client for external APIs
- `@prisma/client`: ORM client
- `canvas`: PNG image generation
- `express-rate-limit`: Rate limiting middleware
- `dotenv`: Environment variable management
- Development tools: TypeScript, ts-node, nodemon, eslint, prettier

### Step 3: Configure Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=mysql://username:password@localhost:3306/country_exchange_db

# External API URLs
COUNTRIES_API_URL=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_RATES_API_URL=https://open.er-api.com/v6/latest/USD

# Cache Configuration
CACHE_DIR=./cache

# Optional: Timeout for external API calls (milliseconds)
EXTERNAL_TIMEOUT_MS=10000
```

**Environment Variables Explanation:**

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default 3000)
- `DATABASE_URL`: MySQL connection string
- `COUNTRIES_API_URL`: REST Countries API endpoint
- `EXCHANGE_RATES_API_URL`: Exchange rates API endpoint
- `CACHE_DIR`: Directory for caching generated images
- `EXTERNAL_TIMEOUT_MS`: Timeout for external HTTP requests

### Step 4: Set Up the Database

```bash
# Generate Prisma Client based on schema
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate
```

These commands:

1. Generate the Prisma Client (TypeScript types for database)
2. Create/update MySQL database tables

---

## Running the API

### Development Mode (with Auto-Reload)

```bash
npm run dev
```

This starts the server with **nodemon**, which automatically restarts on file changes.

### Production Mode

```bash
# Build the project
npm run build

# Run the compiled version
npm run serve
```

### With Environment File

```bash
npm run devv
```

This uses `dotenv-cli` to load `.env` variables before starting the dev server.

---

## API Endpoints

### 1. **Refresh Countries Data**

Fetches fresh data from external APIs and updates the database.

```http
POST /countries/refresh
```

**Response (Success - 200):**

```json
{
  "message": "Countries refreshed successfully",
  "status": 200,
  "body": {
    "success": true,
    "last_refreshed_at": "2025-10-25T14:30:45.123Z"
  }
}
```

**Response (Error - 503):**

```json
{
  "error": "External data source unavailable",
  "details": "Connection timeout"
}
```

---

### 2. **Get All Countries**

Retrieve a list of all countries with optional filtering and sorting.

```http
GET /countries?region=Africa&currency=ZAR&sort=gdp_desc
```

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `region` | string | Filter by region | `Africa`, `Europe`, `Americas` |
| `currency` | string | Filter by currency code | `USD`, `EUR`, `GBP` |
| `sort` | string | Sort order | `gdp_desc`, `gdp_asc`, or default (by name) |

**Response (Success - 200):**

```json
[
  {
    "id": 1,
    "name": "South Africa",
    "capital": "Pretoria",
    "region": "Africa",
    "population": 59308690,
    "currencyCode": "ZAR",
    "exchangeRate": 18.5,
    "estimatedGdp": 412567890.45,
    "flagUrl": "https://restcountries.com/data/zaf.svg",
    "lastRefreshedAt": "2025-10-25T14:30:45.123Z"
  }
]
```

---

### 3. **Get Country by Name**

Retrieve a specific country by its name.

```http
GET /countries/:name
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Country name (case-insensitive) |

**Example:**

```http
GET /countries/Nigeria
```

**Response (Success - 200):**

```json
{
  "id": 5,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 223804632,
  "currencyCode": "NGN",
  "exchangeRate": 1545.5,
  "estimatedGdp": 215678945.23,
  "flagUrl": "https://restcountries.com/data/nga.svg",
  "lastRefreshedAt": "2025-10-25T14:30:45.123Z"
}
```

**Response (Error - 404):**

```json
{
  "error": "Country not found"
}
```

---

### 4. **Delete Country**

Remove a country from the database.

```http
DELETE /countries/:name
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Country name (case-insensitive) |

**Example:**

```http
DELETE /countries/Nigeria
```

**Response (Success - 200):**

```json
{
  "message": "Nigeria deleted successfully"
}
```

**Response (Error - 404):**

```json
{
  "error": "Country not found"
}
```

---

### 5. **Get Summary Image**

Retrieve a PNG image with country statistics (top 5 by GDP).

```http
GET /countries/image
```

**Response:** PNG image file (binary data)

**Example Usage:**

```html
<img src="http://localhost:3000/countries/image" alt="Country Summary" />
```

![Summary Image Example](./cache/summary.png)

---

### 6. **Get API Status**

Retrieve API health and database statistics.

```http
GET /status
```

**Response (Success - 200):**

```json
{
  "total_countries": 195,
  "last_refreshed_at": "2025-10-25T14:30:45.123Z"
}
```

---

## Request Examples

### Using cURL

```bash
# Get all countries
curl http://localhost:3000/countries

# Get countries in Africa sorted by GDP (descending)
curl "http://localhost:3000/countries?region=Africa&sort=gdp_desc"

# Get specific country
curl http://localhost:3000/countries/Nigeria

# Refresh data
curl -X POST http://localhost:3000/countries/refresh

# Delete country
curl -X DELETE http://localhost:3000/countries/Nigeria

# Get status
curl http://localhost:3000/status

# Get summary image
curl http://localhost:3000/countries/image -o summary.png
```

### Using JavaScript (Fetch API)

```javascript
// Get all countries
const countries = await fetch('http://localhost:3000/countries')
  .then(res => res.json());

// Get countries by region with filters
const africaCountries = await fetch(
  'http://localhost:3000/countries?region=Africa&sort=gdp_desc'
)
  .then(res => res.json());

// Get specific country
const nigeria = await fetch('http://localhost:3000/countries/Nigeria')
  .then(res => res.json());

// Refresh data
await fetch('http://localhost:3000/countries/refresh', { method: 'POST' })
  .then(res => res.json());

// Delete country
await fetch('http://localhost:3000/countries/Nigeria', { method: 'DELETE' })
  .then(res => res.json());
```

### Using Axios

```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:3000' });

// Get all countries
const countries = await API.get('/countries');

// Refresh data
await API.post('/countries/refresh');

// Get country
const country = await API.get('/countries/Nigeria');

// Delete country
await API.delete('/countries/Nigeria');
```

---

## Response Examples

### Success Response Structure

```json
{
  "data": [...],
  "status": 200
}
```

### Error Response Structure

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "status": 400|404|500|503
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request successful |
| 400 | Bad request / Missing required parameter |
| 404 | Resource not found |
| 503 | External data source unavailable |
| 500 | Internal server error |

---

## Error Handling

The API implements centralized error handling with the following error scenarios:

### 1. **Missing Required Fields**

```json
{
  "error": "Validation failed",
  "details": "name parameter is required",
  "status": 400
}
```

### 2. **Resource Not Found**

```json
{
  "error": "Country not found",
  "status": 404
}
```

### 3. **External API Failure**

```json
{
  "error": "External data source unavailable",
  "details": "Connection timeout",
  "status": 503
}
```

### 4. **Database Error**

```json
{
  "error": "Internal server error",
  "status": 500
}
```

### 5. **Rate Limit Exceeded**

```json
{
  "error": "Rate limit exceeded",
  "details": "Too many requests from this IP",
  "status": 429
}
```

---

## Database Schema

### Country Table

```sql
model Country {
  id              String      @id @default(uuid())
  name            String      @unique
  capital         String?
  region          String?
  population      Int
  currency_code    String?
  exchange_rate    Float?
  estimated_gdp    Float?
  flag_url         String?
  last_refreshed_at DateTime
}
```

### Metadata Table

```sql
model Metadata {
  key   String @id
  value String?
}
```

**Stored Metadata:**

- `last_refreshed_at`: Timestamp of last successful data refresh

---

## Project Structure

```bash
├── src/
│   ├── config/
│   │   ├── config.ts           # Environment configuration & validation
│   │   └── db.ts               # Prisma client initialization
│   ├── controllers/
│   │   └── countryController.ts # Request handlers
│   ├── services/
│   │   ├── countryService.ts   # Country business logic
│   │   ├── imageService.ts     # Image generation logic
│   │   └── metaService.ts      # Metadata operations
│   ├── routes/
│   │   └── countryRoute.ts     # API route definitions
│   ├── middlewares/
│   │   ├── errorHandler.ts     # Error handling middleware
│   │   └── logging.ts          # Request logging middleware
│   ├── utils/
│   │   ├── apiError.ts         # Custom error class
│   │   └── rate-limiting.ts    # Rate limiting configuration
│   ├── types/
│   │   └── canvas.d.ts         # TypeScript declarations
│   └── index.ts                # Application entry point
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migration files
├── generated/
│   └── prisma/                 # Generated Prisma Client
├── cache/                      # Generated image cache
├── .env                        # Environment variables (local)
├── .env.example                # Environment template
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

---

## Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Express.js 5.x** | Web framework for REST API |
| **TypeScript 5.x** | Type-safe JavaScript |
| **Prisma 6.x** | ORM for database operations |
| **MySQL 8.0+** | Relational database |
| **Axios 1.x** | HTTP client for external APIs |
| **Node Canvas 3.x** | PNG image generation |
| **express-rate-limit** | API rate limiting |
| **Dotenv** | Environment variable management |
| **Nodemon** | Development auto-reload |
| **ESLint & Prettier** | Code linting & formatting |

---

## Key Features Explained

### 1. **Data Refresh Flow**

When `/countries/refresh` is called:

1. Fetches country data from REST Countries API
2. Fetches exchange rates from ER-API
3. Calculates estimated GDP: `(population × random_multiplier) / exchange_rate`
4. Upserts (insert or update) all countries in database
5. Generates and caches a summary PNG image
6. Returns success status with refresh timestamp

### 2. **Rate Limiting**

- Prevents API abuse by limiting requests per IP
- Configured in `src/utils/rate-limiting.ts`
- Default: 100 requests per 15 minutes

### 3. **Image Generation**

- Creates PNG image with:
  - Total countries count
  - Top 5 countries by estimated GDP
  - Last refresh timestamp
- Cached at `./cache/summary.png`
- Canvas library used for native PNG rendering

### 4. **Filtering & Sorting**

Query parameters allow flexible data retrieval:

- **Filter by region**: `?region=Africa`
- **Filter by currency**: `?currency=USD`
- **Sort by GDP**: `?sort=gdp_desc` or `?sort=gdp_asc`
- **Default sort**: By country name (ascending)

### 5. **Error Handling**

- Centralized middleware catches all errors
- Custom `ApiError` class for structured error responses
- Validation of required environment variables on startup
- External API timeouts handled gracefully

---

## Troubleshooting

### Issue: "Missing required environment variable(s)"

**Solution:** Ensure all required variables in `.env` are set and not empty.

### Issue: "Cannot connect to database"

**Solution:**

- Verify MySQL is running
- Check DATABASE_URL is correct
- Ensure database exists: `CREATE DATABASE country_exchange_db;`

### Issue: "External data source unavailable"

**Solution:**

- Check internet connection
- Verify external API URLs are accessible
- Increase `EXTERNAL_TIMEOUT_MS` if APIs are slow

### Issue: "Port already in use"

**Solution:**

- Change `PORT` in `.env` file
- Or kill process using the port:

  ```bash
  # Windows: netstat -ano | findstr :3000
  # Linux/Mac: lsof -i :3000
  ```

---

## License

ISC © ideategudy

---

## Contributing

Contributions welcome! Please ensure:

- TypeScript strict mode compliance
- Code formatted with Prettier
- ESLint rules pass
- Database migrations included for schema changes
