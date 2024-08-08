import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
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

export default mongoose.model('Message', messageSchema);