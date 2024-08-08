import {NextFunction, Request, Response} from 'express';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers['authorization'] as string;
    
    if (token) {
        token = token.split(' ')[1];
    }
    jwt.verify(token, JWT_SECRET, function (err: any, decoded: any) {
        if (err) {
            console.log(err);
            res.status(401).json({status:"unauthorized"})
        } else {
            let userID = decoded['id'];
            
            req.headers.userID = userID;
            next();
        }
    })
}