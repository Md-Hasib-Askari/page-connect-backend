import { Request, Response } from "express";

import {userModel as User, IUserDocument} from "../Models/Users.ts";
import { PageModel as Page, IPageDocument} from "../Models/Pages.ts";
import {messageModel as Message, IMessageDocument} from "../Models/Messages.ts";
import { refreshPageToken } from "../Utils/refreshTokens.ts";

const FB_URI = process.env.FB_URI || "https://graph.facebook.com";

const getPages = async (req: Request, res: Response) => {
  // Get user ID from headers
  const userID = req.headers["userID"] as string;
  
  try {
    // search for user in the database using userID
    const user = await User.findOne({
      _id: userID,
    }) as IUserDocument;
    
    // if user is not found, return unauthorized error
    if (!user) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
    const accessToken = user.accessToken.token; // get access token from user object

    // fetch pages using the access token
    const response = await fetch(
      `${FB_URI}/me/accounts?fields=access_token%2Cid%2Cname&access_token=${accessToken}`
    );
    const data = await response.json() as any;

    return res.json({ status: "success", data: data.data });
  } catch (error: any) {
    console.error(error);
    return res
      .status(400)
      .json({ status: "error", error: error.message || "something went wrong." });
  }
};

const getPage = async (req: Request, res: Response) => {
  // Get user ID from headers
  const userID = req.headers["userID"] as string;
  
  try {
    // search for user in the database using userID
    const user = await User.findOne({
      _id: userID,
    }) as IUserDocument;

    // if user is not found, return unauthorized error
    if (!user) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
    const pageID = user.page; // get page ID from user object
    
    // search for page in the database using pageID
    const page = await Page.findOne({
      pageID,
    }) as IPageDocument;

    // validating page access token
    if (page) await refreshPageToken(page, user.accessToken.token);
    
    const data = {
      pageID: page?.pageID,
      name: page?.name,
      accessToken: page?.accessToken.token
    }

    return res.json({ status: "success", data });

  } catch (error: any) {
    console.error(error);
    return res
      .status(400)
      .json({ status: "error", error: error.message || "something went wrong." });
  }
}

const savePage = async (req: Request, res: Response) => {
  // Get user ID from headers
  const userID = req.headers["userID"] as string;
  const { pageID, accessToken, name } = req.body as { pageID: string, accessToken: string, name: string };
  
  try {
    // search for user in the database using userID
    const user = await User.findOne({
        _id: userID,
    }) as IUserDocument;

    // if user is not found, return unauthorized error
    if (!user) {
        console.warn("User not found");
        return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    // search for page in the database using pageID
    let pageData = await Page.findOne({
        pageID
     }) as IPageDocument;

    // fetch page access token information
    const fb_response = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${user.accessToken.token}`)
    const tokenData = await fb_response.json() as {data: {expires_at: number}};
    
    // if page is not found, create a new page
    if (!pageData) {
        pageData = new Page({
            pageID,
            accessToken: {
              token: accessToken,
              expires: tokenData.data.expires_at
            },
            name,
        });
        await pageData.save();
    }

    // save page id to user object
    user.page = pageData.pageID;
    await user.save();

    // fetch all messages from the page and save them to the database
    const response = await fetch(
      `${FB_URI}/${pageID}/conversations?fields=participants%2Cmessages%7Bmessage%2Cfrom%2Ccreated_time%7D&access_token=${accessToken}`
    ) as any;
    const data = await response.json() as any;
    const conversations = data.data as {
        participants: { data: { id: string, name: string }[] },
        messages: { data: { message: string, from: { id: string, name: string }, created_time: string }[] }
        }[]

    
    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];
      let recipient = conversation.participants.data[0] as { id: string, name: string } | { id: string, name: string, profileImage: string };

      // lastMessage
      const latest = conversation.messages.data[0] as { created_time: string; message: string };
      const lastMessage = {
        message: latest.message,
        createdTime: latest.created_time
      }

      // messages[]
      const messages = conversation.messages.data.map((message: any) => {
        return {
          sender: {
            id: message.from.id,
            name: message.from.name
          },
          message: message.message,
          createdTime: message.created_time
        };
      });
      
      // fetch recipient profile picture and save it to database
      const image = await fetch(
        `${FB_URI}/${recipient.id}?fields=profile_pic&access_token=${accessToken}`
      );
      let imageUrl = await image.json() as { profile_pic: string } | string;
      if (typeof imageUrl !== "string") {
        imageUrl = imageUrl.profile_pic as string;
      }

      // recipient
      recipient = {
        id: recipient.id,
        name: recipient.name,
        profileImage: imageUrl // update image
      }

      // save all the previous messages
      await Message.create({
        pageID,
        recipient,
        lastMessage,
        messages,
      }) as IMessageDocument;
    }

    return res.json({ status: "success", message: "Page saved successfully" });

  } catch (error: any) {
    console.error(error);
    return res
      .status(400)
      .json({ status: "error", error: error.message || "something went wrong." });
  }
};

export {
  getPages,
  getPage,
  savePage,
};