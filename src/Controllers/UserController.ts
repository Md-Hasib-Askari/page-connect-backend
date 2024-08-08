import { Request, Response } from 'express'
;
import { generateToken } from '../Utils/jwt.ts';
import User from '../Models/Users.ts';

const FB_URI = process.env.FB_URI || 'https://graph.facebook.com';

export const saveAccessToken = async (req: Request, res: Response) => {
    const { accessToken } = req.body;
    const response = await fetch(`${FB_URI}/me?access_token=${accessToken}`);
    const userData = await response.json() as { id: string, name: string };

    try {
        let user = await User.findOne({ facebookID: userData.id });
        if (!user) {
            // If user does not exist, create a new user
            user = new User({ facebookID: userData.id, accessToken, name: userData.name });
        } else {
            // Update access token if user already exists
            user.accessToken = accessToken;
        }
        // Generate JWT token and update user
        const jwtToken = generateToken(user._id.toString());
        user.jwtToken = jwtToken;
        
        await user.save();
        
        res.status(201).json({ jwtToken, status: 'success' });
        
    } catch (error) {
        res.status(400).json({ status: 'error', error: 'Invalid access token' });
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const userID = req.headers['userID'] as string;
    try {
        const user = await User.findOne({ _id: userID });
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }
        res.json({ status: 'success', message: 'User verified.' });
    } catch (error) {
        res.status(400).json({ status: 'error', error: 'Invalid user' });
    }
}

export const getUser = async (req: Request, res: Response) => {
    const userID = req.headers['userID'] as string;
    try {
        const user = await User.findOne({ _id: userID });
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }
        res.json({ status: 'success', data: user.name });
    } catch (error) {
        res.status(400).json({ status: 'error', error: 'Invalid user' });
    }
}