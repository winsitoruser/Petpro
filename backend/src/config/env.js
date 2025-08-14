const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Define the environment
const environment = process.env.NODE_ENV || 'development';

// Path to env file based on environment
const envPath = path.resolve(__dirname, `../../.env.${environment}`);

// Check if environment file exists
if (!fs.existsSync(envPath)) {
  console.error(`Environment file not found: ${envPath}`);
  process.exit(1);
}

// Load environment variables from the file
dotenv.config({ path: envPath });

// Configuration object with all environment variables
const config = {
  env: environment,
  isProduction: environment === 'production',
  isStaging: environment === 'staging',
  isDevelopment: environment === 'development',
  server: {
    port: process.env.PORT || 8080,
    bodyLimit: '10mb',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: parseInt(process.env.JWT_EXPIRATION || '86400', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

module.exports = config;
