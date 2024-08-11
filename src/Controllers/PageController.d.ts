import { Request, Response } from "express";
declare const getPages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const getPage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const savePage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { getPages, getPage, savePage, };
