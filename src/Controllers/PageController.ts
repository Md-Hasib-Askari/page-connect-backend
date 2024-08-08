import { Request, Response } from "express";

import User from "../Models/Users.ts";
import Page from "../Models/Pages.ts";

const FB_URI = process.env.FB_URI || "https://graph.facebook.com";

const getPages = async (req: Request, res: Response) => {
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
    const accessToken = user.accessToken; // get access token from user object

    // fetch pages using the access token
    const response = await fetch(
      `${FB_URI}/me/accounts?fields=access_token%2Cid%2Cname&access_token=${accessToken}`
    );
    const data = await response.json() as any;
    return res.json({ status: "success", data: data.data });
  } catch (error: any) {
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
    });

    // if user is not found, return unauthorized error
    if (!user) {
      return res.status(401).json({ status: "error", error: "Unauthorized" });
    }
    const pageID = user.page; // get page ID from user object

    // search for page in the database using pageID
    const page = await Page.findOne({
      pageID,
    });
    
    const data = {
      pageID: page?.pageID,
      name: page?.name,
      accessToken: page?.accessToken
    }

    return res.json({ status: "success", data });

  } catch (error: any) {
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
    });

    // if user is not found, return unauthorized error
    if (!user) {
        return res.status(401).json({ status: "error", error: "Unauthorized" });
    }

    // search for page in the database using pageID
    let pageData = await Page.findOne({ 
        pageID
     });    
    
    // if page is not found, create a new page
    if (!pageData) {
        pageData = new Page({
            pageID,
            accessToken: accessToken,
            name,
        });
        await pageData.save();
    }

    // save page id to user object
    user.page = pageData.pageID;
    await user.save();

    res.json({ status: "success", message: "Pages saved successfully" });

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