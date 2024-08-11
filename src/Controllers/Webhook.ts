import { Request, Response } from 'express';

import { getSocketIO } from '../../socket.ts';
import {messageModel as Message} from '../Models/Messages.ts';
import {IPageDocument, PageModel as Page} from '../Models/Pages.ts';

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
        body.entry.forEach(async (entry: any) => {
            const pageID = entry.messaging[0].recipient.id;
            const webhook_event = entry.messaging[0];

            // fetch access token from the database of the page
            const page = await Page.findOne({
                pageID: pageID,
            }) as IPageDocument;
            const accessToken = page?.accessToken; // get access token from user object
            const senderID = webhook_event.sender.id;

            // fetch user from facebook
            const fields = ['id', 'name', 'profile_pic'].join(',')
            const sender = await fetch(`${FB_URI}/${senderID}?fields=${fields}&access_token=${accessToken}`);
            const senderJson = await sender.json();
            const senderName = senderJson.name;
            const senderImage = senderJson.profile_pic;

            // create new message
            const newMessage = {
                pageID,
                recipient: {
                    id: webhook_event.sender.id,
                    name: senderName,
                    profileImage: senderImage
                },
                lastMessage: {
                    message: webhook_event.message?.text,
                    createdTime: webhook_event.timestamp,
                },
                messages: [{
                    sender: {
                        name: senderName,
                        id: senderID,
                    },
                    message: webhook_event.message?.text,
                    createdTime: webhook_event.timestamp,
                }]
            }
        
            // save message
            if (webhook_event.message) {
                await handleMessage(senderID, newMessage);
            }
        });
        return res.status(200).send('EVENT_RECEIVED');
    } else {
        return res.sendStatus(404);
    }
}

const handleMessage = async (senderID: string, receivedMessage: any) => {
    if (receivedMessage) {
        const io = getSocketIO();

        try {
            // find message by user id
            const sender = await Message.findOne({ 'recipient.id': senderID });

            // if user exists update the messages or insert whole message
            if (!sender) {
                await Message.create(receivedMessage);
            } else {
                await Message.updateOne({ 'recipient.id': senderID }, 
                    { 
                        $set: {
                            'lastMessage.message': receivedMessage.lastMessage.message,
                            'lastMessage.createdTime': receivedMessage.lastMessage.timestamp
                        },
                        $push: { messages: receivedMessage.messages[0] } 
                    });                
            }
            io.emit('private_message', receivedMessage);
            console.log('Webhook.ts:102 => Message sent.')
        } catch (err: any) {
            console.error('Error: ', err.message);
        }
    }
}

export {
    verifyWebhook,
    initWebhook,
};