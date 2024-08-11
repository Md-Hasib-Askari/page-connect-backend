import { Request, Response } from 'express'
;
import { generateToken } from '../Utils/jwt.ts';
import {userModel as User, IUserDocument} from '../Models/Users.ts';

const FB_URI = process.env.FB_URI || 'https://graph.facebook.com';

export const saveAccessToken = async (req: Request, res: Response) => {
    const { accessToken, expiresIn } = req.body;
    
    const response = await fetch(`${FB_URI}/me?access_token=${accessToken}`);
    const userData = await response.json() as { id: string, name: string };

    try {
        let user = await User.findOne({ facebookID: userData.id }) as IUserDocument;
        
        if (!user) {
            // If user does not exist, create a new user
            user = new User({ 
                facebookID: userData.id, 
                'accessToken.token': accessToken, 
                name: userData.name 
            });
        } else {
            // Update access token if user already exists
            user.accessToken = {
                token: accessToken,
                expiresIn: expiresIn
            };
        }

        // Generate JWT token and update user
        const jwtToken = generateToken(user._id.toString(), expiresIn);
        user.jwtToken = jwtToken;
        
        await user.save();
        
        res.status(201).json({ jwtToken, status: 'success' });
        
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'error', error: 'Invalid access token' });
    }
}

export const verifyUser = async (req: Request, res: Response) => {
    const userID = req.headers['userID'] as string;
    try {
        const user = await User.findOne({ _id: userID }) as IUserDocument;
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }

        // check for user token expiry
        const tokenExpiry = Date.now() + 1000*user.accessToken.expiresIn as number;

        if (tokenExpiry <= Date.now()) {
            return res.status(401).json({ status: 'error', error: 'Token expired' });
        }

        res.json({ status: 'success', data: user.name });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'error', error: 'Invalid user' });
    }
}

export const getUser = async (req: Request, res: Response) => {
    const userID = req.headers['userID'] as string;
    try {
        const user = await User.findOne({ _id: userID }) as IUserDocument;
        if (!user) {
            return res.status(404).json({ status: 'error', error: 'User not found' });
        }
        res.json({ status: 'success', data: user.name });
    } catch (error) {
        console.error(error);
        res.status(400).json({ status: 'error', error: 'Invalid user' });
    }
}

export const logout = async (req: Request, res: Response) => {
    const userID = req.headers['userID'] as string;
    try {
        await User.findOneAndUpdate({ _id: userID }, { 
            'accessToken.token': '',
            'accessToken.expiresIn': 0
        });
        return res.json({ status: 'success', message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ status: 'error', error: 'Invalid user' });
    }
}
