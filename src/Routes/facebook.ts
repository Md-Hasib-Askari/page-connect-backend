const express = require('express');

const WebhookController = require('../Controllers/Webhook');

const router = express.Router();

// Webhook for receiving messages
router.post('/webhook', WebhookController.initWebhook);
// Verify webhook
router.get('/webhook', WebhookController.verifyWebhook);

module.exports = router;
