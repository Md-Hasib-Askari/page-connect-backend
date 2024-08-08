import { text } from "body-parser";
import { Request, Response } from "express";

const User = require("../Models/Users");
const Message = require("../Models/Messages");
const Page = require("../Models/Pages");

const FB_URI = process.env.FB_URI || "https://graph.facebook.com";

const syncMessages = async (req: Request, res: Response) => {
    // Get user ID from headers
    const userID = req.headers["userID"] as string;

    try {
        // search for user in the database using userID
        const user = await User.findOne({
            _id: userID,
        });

        // if user is not found, return unauthorized error
        if (!user) {
            return res.status(401).json({ status: "error", error: "Unauthorized" });
        }

        // fetch access token from the database of the page
        const page = await Page.findOne({
            _id: user.page,
        });
        const accessToken = page.accessToken; // get access token from user object

        // fetch messages from Facebook using the access token
        const fields = ['participants', 'snippet', 'messages{from,message,created_time}'].join(',');
        const response = await fetch(`${FB_URI}/398079816719075/conversations?fields=${fields}&access_token=${accessToken}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json() as any;
        const messagesPromises = data.data.map(async (conversation: any) => {
            const rcvID = conversation.participants.data[0].id;
            const rcvName = conversation.participants.data[0].name;
            const snippet = conversation.snippet.length > 17 ? conversation.snippet.substring(0, 17) : conversation.snippet;

            // image url
            const image = await fetch(`${FB_URI}/${rcvID}/picture?redirect=false&access_token=${accessToken}`);
            const imageJson = await image.json();
            console.log(imageJson);
            
            
            // map messages
            const messages = conversation.messages.data.map((message: any) => {
                return {
                    sender: {
                        name: message.from.name,
                        id: message.from.id
                    },
                    message: message.message,
                    createdTime: message.created_time
                }
            });
            const lastMessage = { 
                createdTime: messages[0].createdTime.toString(),
                message: snippet
            };            
            const user = {
                id: rcvID,
                name: rcvName,
                picture: {
                    url: imageJson?.data.url,
                    width: imageJson?.data.width,
                    height: imageJson?.data.height
                }
            }
           
            // update the existing message object in the database
            await Message.findOneAndUpdate({
                'user.id': rcvID
            }, {
                user,
                lastMessage,
                messages
            }, { upsert: true });
            
            return {
                messages,
                user,
                lastMessage: lastMessage
            }
        });   
        
        // resolve all messages
        const resolvedMessages = await Promise.all(messagesPromises);
        
        return res.status(201).json({ status: "success", data: resolvedMessages });

    } catch (error: any) {
        return res
            .status(400)
            .json({ status: "error", error: error.message || "something went wrong." });
    }
}

const sendMessage = async (userID: string, recipientID: string, message: string) => {
    try {
        // search for user in the database using userID
        const user = await User.findOne({
            _id: userID,
        });

        // if user is not found, return unauthorized error
        if (!user) {
            return { status: "error", error: "Unauthorized" };
        }

        // fetch access token from the database of the page
        const pageID = user.page;
        const page = await Page.findOne({
            _id: pageID,
        });
        const accessToken = page.accessToken; // get access token from user object

        // send message to Facebook using the access token
        const query = [`recipient=${recipientID}`, `message=${{text: message}}`, 'messaging_type=REPONSE'].join(',');
        const response = await fetch(`${FB_URI}/${pageID}/messages?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                recipient: {
                    id: recipientID
                },
                message: {
                    text: message
                },
                messaging_type: 'RESPONSE'
            })
        });
        const data = await response.json() as any;

        console.log(data);
        
        return { status: "success", data: data };

    } catch (error: any) {
        return { status: "error", error: error.message || "something went wrong." };
    }
}

module.exports = {
    syncMessages,
    sendMessage
};