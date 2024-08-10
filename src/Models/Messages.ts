import mongoose, {Document, Model, Schema} from 'mongoose';

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

interface IMessageDocument extends IMessage, Document {}

const messageSchema: Schema<IMessageDocument> = new mongoose.Schema<IMessageDocument>({
    pageID: {
        type: String,
        required: true
    },
    recipient: {
        id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        profileImage: String
    },
    lastMessage: {
        message: String,
        createdTime: {
            type: Date,
        }
    },
    messages: [{
        sender: {
            name: String,
            id: String
        },
        message: {
            type: String,
            required: true
        },
        createdTime: Date,
    }]
}, {versionKey: false, timestamps: true});

const messageModel: Model<IMessageDocument> = mongoose.model<IMessageDocument>('Message', messageSchema);

export {messageModel, IMessageDocument};