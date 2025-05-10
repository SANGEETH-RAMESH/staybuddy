import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import passport from '../src/passport/passportConfig';
import { initializeSocket } from './socket/socket';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ✅ Middleware
app.use(morgan('dev'));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'refresh-token'],
    credentials: true,
}));
app.use(session({
    secret: process.env.SECRET_KEY || 'defaultSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Routes
import admin_route from './router/adminRoute';
import user_route from './router/userRoute';
import host_route from './router/hostRoute';
import order_route from './router/orderRoute';
import chat_route from './router/chatRoute';
import chatService from './service/chatService';
import chatRepository from './respository/chatRepository';

app.use('/admin', admin_route);
app.use('/user', user_route);
app.use('/host', host_route);
app.use('/order', order_route);
app.use('/chat', chat_route);

// ✅ Start Socket.IO Server
const ChatRepository = new chatRepository
const ChatService = new chatService(ChatRepository);
initializeSocket(server,ChatService);

// ✅ Start the server
server.listen(4000, () => {
    console.log("✅ Server is listening on port 4000");
});