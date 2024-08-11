import { Document, Model } from 'mongoose';
interface IMessage {
    pageID: string;
    recipient: {
        id: string;
        name: string;
        profileImage?: string;
    };
    lastMessage: {
        message: string;
        createdTime: Date;
    };
    messages: Array<{
        sender: {
            name: string;
            id: string;
        };
        message: string;
        createdTime: Date;
    }>;
}
interface IMessageDocument extends IMessage, Document {
}
declare const messageModel: Model<IMessageDocument>;
export { messageModel, IMessageDocument };
