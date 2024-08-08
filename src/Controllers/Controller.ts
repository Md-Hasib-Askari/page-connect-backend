/*
* Add all your controller function here and export them
* */
import {Request, Response} from 'express';
const welcome = require('../Helper/welcome');

exports.home = (req: Request, res: Response) => {
    welcome.showMsg(res);
    res.end();
}