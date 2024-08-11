import { Request, Response } from 'express';
declare const verifyWebhook: (req: Request, res: Response) => void;
declare const initWebhook: (req: Request, res: Response) => Response<any, Record<string, any>>;
export { verifyWebhook, initWebhook, };
