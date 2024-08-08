/*
* Add all your Helper functions here and export them
* */
import {Response} from 'express';


exports.showMsg = (res: Response) => {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("Hello Express JS");
}