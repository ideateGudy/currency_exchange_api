import 'dotenv/config';
import { customApiError } from '../utils/apiError.ts';

interface Config {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  COUNTRIES_API_URL: string;
  EXCHANGE_RATES_API_URL: string;
  CACHE_DIR: string;
}

// Function to assert required environment variables are set
function assertEnvVars(required: string[]) {
  const missing = required.filter((name) => {
    const val = process.env[name];
    return val === undefined || val === null || String(val).trim() === '';
  });

  if (missing.length > 0) {
    throw new customApiError(
      `Missing required environment variable(s): ${missing.join(', ')}. Please set them and restart the application.`,
      500
    );
  }
}

// List required environment variables here.
const REQUIRED_ENVS = ['NODE_ENV', 'PORT', 'DATABASE_URL', 'COUNTRIES_API_URL', 'EXCHANGE_RATES_API_URL', 'CACHE_DIR'];

// Validate at module initialization so the app fails fast on startup when vars are missing.
assertEnvVars(REQUIRED_ENVS);

const parsedPort = parseInt(process.env.PORT ?? '', 10);
const config: Config = {
  PORT: Number.isNaN(parsedPort) ? 3000 : parsedPort,
  NODE_ENV: process.env.NODE_ENV as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  COUNTRIES_API_URL: process.env.COUNTRIES_API_URL as string,
  EXCHANGE_RATES_API_URL: process.env.EXCHANGE_RATES_API_URL as string,
  CACHE_DIR: process.env.CACHE_DIR as string,
};

export default config;