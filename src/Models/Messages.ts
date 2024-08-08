const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        id: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        }
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
        createdTime: {
            type: Date,
        }
    }]
}, {versionKey: false, timestamps: true});

module.exports = mongoose.model('Message', messageSchema);