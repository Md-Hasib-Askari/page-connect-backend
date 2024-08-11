import { Request, Response } from 'express';
export declare const saveAccessToken: (req: Request, res: Response) => Promise<void>;
export declare const verifyUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
