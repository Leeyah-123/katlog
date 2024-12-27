import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { createServer } from 'http';
import { config } from './config';
import { errorHandler } from './middlewares';
import webhookRoutes from './modules/webhook';
import { WebhookService } from './modules/webhook/webhook.service';
import logger from './utils/logger';

const app = express();
const server = createServer(app);

// Middlewares
app.use(cors({ origin: config.mainServerUrl }));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ limit: '1gb', extended: true }));
app.use(helmet());

// Initialize WebSocket service with HTTP server
const wsService = new WebhookService();
wsService.initialize(server);

// Routes
app.use('/health', (_, res) => res.send('OK'));
app.use('/api', webhookRoutes);

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Performing graceful shutdown...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

app.use(errorHandler);

const port = config.port;

// Start server
server.listen(port, async () => {
  logger.info(`App listening on port ${port}`);
});
