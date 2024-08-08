import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
const { verifyToken } = require('./src/Utils/jwt');
const { sendMessage } = require('./src/Controllers/MessageController');

let io: SocketIOServer | null = null;

const initSocket = (server: HttpServer) => {
    io = require('socket.io')(server, {
        cors: {
            origin: '*',
            method: ['GET', 'POST']
        }
    });

    if (!io) {
        throw new Error('Socket.io failed to initialize');
    }
    io.use((socket, next) => {
        console.log("Socket connected");

        const token = socket.handshake.auth.token;

        if (token) {
            const { id: userID } = verifyToken(token);
            socket.data = { userID };
            return next();
        }
        return next(new Error('Authentication error'));
    });

    io.on('connection', (socket) => {
        console.log('User connected');
        
        // private message
        socket.on('private_message', ({ token, recipient, message }) => {
            console.log('Message: ', { token, recipient, message });
            const userID = verifyToken(token)?.id;

            // send message to recipient
            if (userID) {
                sendMessage(userID, recipient, message).then((response: any) => {
                    socket.emit('private_message', response);
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });

    return io;
}

const getSocketIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized. Call initializeSocketIO first.');
    }
    return io;
}

module.exports = { 
    initSocket,
    getSocketIO
};