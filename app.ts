/*
* Add all your Express app configurations here
* */


const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const hpp = require('hpp');
const xssClean = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { initSocket } = require('./socket');
const { verifyToken } = require('./src/Utils/jwt');

const apiRouter = require('./src/Routes/Route');
const webhookRouter = require('./src/Routes/facebook');

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
    origin: ['http://localhost:3000', 'https://localhost:3000', '*'],
}));
app.use(bodyParser.json());
app.use(helmet());
app.use(hpp({checkBody: true, checkQuery: true}));
app.use(xssClean());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
        const { id: userID } = verifyToken(token);
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

module.exports = {
    server,
    io
};