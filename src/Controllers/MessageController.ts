import { Request, Response } from "express";

import {userModel as User, IUserDocument} from "../Models/Users.ts";
import { messageModel as Message, IMessageDocument} from "../Models/Messages.ts";
import {IPageDocument, PageModel as Page} from "../Models/Pages.ts";
import { refreshPageToken } from "../Utils/refreshTokens.ts";

const FB_URI = process.env.FB_URI || "https://graph.facebook.com";

const syncMessages = async (req: Request, res: Response) => {
    // Get user ID from headers
    const userID = req.headers["userID"] as string;

    try {
        // search for user in the database using userID
        const user = await User.findOne({
            _id: userID,
        }) as IUserDocument

        // if user is not found, return unauthorized error
        if (!user) {
            console.warn("Unauthorized");
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
        console.error(error);
        
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
        }) as IUserDocument;
        // if user is not found, return unauthorized error
        if (!user) {
            console.warn("Unauthorized");
            return { status: "error", error: "Unauthorized" };
        }

        // fetch access token from the database of the page
        const page = await Page.findOne({
            pageID: user.page,
        }) as IPageDocument;
        const pageID = page?.pageID;

        // refresh page token if expired
        if (page) await refreshPageToken(page, user.accessToken.token);

        // send message to Facebook using the access token
        const response = await fetch(`${FB_URI}/${pageID}/messages?access_token=${page?.accessToken.token}`, {
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

        if (data.error) {
            console.warn(data.error.message || "something went wrong.");
            return { status: "error", error: data.error.message || "something went wrong." };
        }
        
        const newMessage = {
            sender: {
                "name": page?.name,
                "id": pageID
            },
            message: message,
            createdTime: new Date()
        }
        
        await Message.findOneAndUpdate({
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
        }, { upsert: true }) as IMessageDocument;

        return { status: "success", data: newMessage };

    } catch (error: any) {
        console.error(error);
        return { status: "error", error: error.message || "something went wrong." };
    }
}

export {
    syncMessages,
    sendMessage
};