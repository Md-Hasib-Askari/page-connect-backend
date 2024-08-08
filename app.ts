/*
* Add all your Express app configurations here
* */

import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { initSocket } from './socket.ts';
import { verifyToken } from './src/Utils/jwt.ts';

import apiRouter from './src/Routes/Route.ts';
import webhookRouter from './src/Routes/facebook.ts';

// Server Initialization
const app = express();
const server = http.createServer(app);
const io = initSocket(server); // Socket.io connection

// Middlewares
app.set('trust proxy', 1);
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 100 requests per windowMs
}));
app.use(cors({
    origin: ['http://localhost:3000', 'https://localhost:3000', 'https://page-connect.vercel.app'],
}));
app.use(bodyParser.json());
app.use(helmet());
app.use(hpp({checkBody: true, checkQuery: true}));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chatapp';
mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
});

// Routes
app.use('/api/V1/', apiRouter);
app.use('/', webhookRouter);
app.get('/test', (req: any, res: any) => {
    console.log('Test route');
    
    res.send('Hello World');
});

// Socket.io connection
io.use((socket: any, next: any) => {
    console.log("Socket connected");
    
    const token = socket.handshake.auth.token;
    
    if (token) {
        const { id: userID } = verifyToken(token) as any;
        socket.data = { userID };
        return next();
    }
    return next(new Error('Authentication error'));
});

io.on('connection', (socket: any) => {
    console.log('User connected');
    // private message
    socket.on('private_message', (data: any) => {
        console.log('Message: ', data);
        io.emit('private_message', `Recieved from server. data: ${data.message}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

export { server, io };