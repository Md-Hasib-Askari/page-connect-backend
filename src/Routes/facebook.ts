import express from 'express';

import * as WebhookController from '../Controllers/Webhook.ts';

const router = express.Router();

// Webhook for receiving messages
router.post('/webhook', WebhookController.initWebhook);
// Verify webhook
router.get('/webhook', WebhookController.verifyWebhook);

export default router;