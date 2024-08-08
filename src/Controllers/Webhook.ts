import { Request, Response } from 'express';

const { getSocketIO } = require('../../socket');

const FB_URI = process.env.FB_URI || 'https://graph.facebook.com';

const verifyWebhook = (req: Request, res: Response) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('Webhook verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
}

const initWebhook = (req: Request, res: Response) => {
    const body = req.body;
    
    if (body.object === 'page') {
        body.entry.forEach((entry: any) => {
            const pageID = entry.messaging[0].recipient.id;
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;
            const message = {
                text: webhook_event.message?.text,
                user: sender_psid,
                time: Date.now()
            };

            if (webhook_event.message) {
                handleMessage(sender_psid, pageID, message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });
        return res.status(200).send('EVENT_RECEIVED');
    } else {
        return res.sendStatus(404);
    }
}

const handleMessage = (sender_psid: string, pageID: string, received_message: any) => {
    if (received_message.text) {
        const io = getSocketIO();
        
        io.emit('private_message', received_message);
    }
}

const handlePostback = (sender_psid: string, received_postback: any) => {
    let response;
    const payload = received_postback.payload;
    if (payload === 'yes') {
        response = { text: 'Thanks!' };
    } else if (payload === 'no') {
        response = { text: 'Oops, try sending another image.' };
    }
    callSendAPI(sender_psid, response);
}

const callSendAPI = (sender_psid: string, response: any) => {
    const request_body = {
        recipient: {
            id: sender_psid
        },
        message: response
    }

    fetch(`${FB_URI}/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(request_body)
    })
    .then(res => {
        if (res.ok) {
            console.log('Message sent!');
        }
    })
    .catch(err => {
        console.error('Unable to send message:' + err);
    });
}

// send message to user
const sendMessage = (sender_psid: string, message: string) => {
    const response = {
        text: message
    }
    callSendAPI(sender_psid, response);
}

module.exports = {
    verifyWebhook,
    initWebhook,
};