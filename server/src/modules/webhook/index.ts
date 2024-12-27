import { Router } from 'express';
import { verifyUser } from '../../middlewares';
import { WebhookController } from './webhook.controller';

const router = Router();
const Controller = new WebhookController();

router.get('/webhook', verifyUser, Controller.handleWebSocketUpgrade);
router.post('/webhook', Controller.handleTransactions);

export default router;
