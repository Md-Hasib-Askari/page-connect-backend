// const express = require('express');
import express from 'express';

// const WebhookController = require('../Controllers/Webhook');
import * as WebhookController from '../Controllers/Webhook.ts';

const router = express.Router();

// Webhook for receiving messages
router.post('/webhook', WebhookController.initWebhook);
// Verify webhook
router.get('/webhook', WebhookController.verifyWebhook);

export default router;
// module.exports = router;
