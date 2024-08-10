import {NextFunction, Request, Response} from 'express';
import jwt, {GetPublicKeyOrSecret, Secret} from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as Secret | GetPublicKeyOrSecret;

export default (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers['authorization'] as string;
    
    if (token) {
        token = token.split(' ')[1];
    }
    jwt.verify(token, JWT_SECRET, function (err: any, decoded: any) {
        if (err) {
            console.log(err);
            res.status(401).json({status:"unauthorized"})
        } else {
            req.headers.userID = decoded['id'] as string;
            next();
        }
    })
}