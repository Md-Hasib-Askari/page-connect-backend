import { Request, Response } from "express";
declare const syncMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const sendMessage: (userID: string, recipientID: string, message: string) => Promise<{
    status: string;
    error: any;
    data?: undefined;
} | {
    status: string;
    data: {
        sender: {
            name: string;
            id: string;
        };
        message: string;
        createdTime: Date;
    };
    error?: undefined;
}>;
export { syncMessages, sendMessage };
