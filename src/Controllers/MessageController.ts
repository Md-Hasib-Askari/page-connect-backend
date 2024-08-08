import { text } from "body-parser";
import { Request, Response } from "express";

// const User = require("../Models/Users");
// const Message = require("../Models/Messages");
// const Page = require("../Models/Pages");
import User from "../Models/Users.ts";
import Message from "../Models/Messages.ts";
import Page from "../Models/Pages.ts";

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
        
        const messages = await Message.find({
            pageID: user.page
        }, {
            _id: 0,
            recipient: 1,
            lastMessage: 1,
            pageID: 1,
            messages: 1
        })
        
        return res.status(201).json({ status: "success", data: messages });

    } catch (error: any) {
        console.log(error);
        
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
        const page = await Page.findOne({
            pageID: user.page,
        });
        const pageID = page?.pageID;
        const accessToken = page?.accessToken; // get access token from user object

        // send message to Facebook using the access token
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

        console.log('data ', data);
    
        console.log('testing..........');
        
        const newMessage = {
            sender: {
                "name": page?.name,
                "id": pageID
            },
            message: message,
            createdTime: new Date()
        }
        console.log('newMessage ', newMessage);
        
        const result = await Message.findOneAndUpdate({
            pageID: pageID,
            'recipient.id': recipientID
        }, {
            $set: {
                'lastMessage.message': message,
                'lastMessage.createdTime': new Date()
            },
            $push: {
                messages: newMessage
            }
        }, { upsert: true });    

        return { status: "success", data: newMessage };

    } catch (error: any) {
        return { status: "error", error: error.message || "something went wrong." };
    }
}

export {
    syncMessages,
    sendMessage
};
// module.exports = {
//     syncMessages,
//     sendMessage
// };