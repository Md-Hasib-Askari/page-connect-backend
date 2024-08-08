/*
* Add all your Middleware functions here and export them
* */
import {Request, Response, NextFunction} from 'express';

exports.showMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("This is from middleware");
    next();
}