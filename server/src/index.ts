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
app.use('/api', webhookRoutes);

// Error Handling
app.use(errorHandler);

const port = config.port;

// Start server
server.listen(port, async () => {
  logger.info(`App listening on port ${port}`);
});
