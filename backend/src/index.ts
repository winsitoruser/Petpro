import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/env';
import logger, { morganStream, initializeLogger } from './config/logger';
import apiRoutes from './routes';
import errorHandler from './middleware/errorHandler';
import { requestTracker } from './middleware/requestTracker';

const app = express();

// Initialize logger
initializeLogger();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestTracker());
app.use(morgan('combined', { stream: morganStream }));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.env });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = config.server.port;
app.listen(port, () => {
  logger.info(`Server running in ${config.env} mode on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

export default app;
