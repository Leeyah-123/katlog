import { Router } from 'express';
import { WebhookController } from './webhook.controller';
import { verifyUser } from '../../middlewares';

const router = Router();
const Controller = new WebhookController();

router.get('/webhook', verifyUser, Controller.handleWebSocketUpgrade);
router.post('/webhook', Controller.handleTransaction);

export default router;
