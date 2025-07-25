import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import morgan from 'morgan';
import session from 'express-session';
import passport from './passport/passportConfig';
import { initializeSocket } from './socket/socket';
import { stream  } from './utils/logger'; 

dotenv.config();

const app: Application = express();
const server = http.createServer(app);




mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Connection Error:", err));
// console.log(process.env.MONGO_URI)
console.log("Mongoose connection readyState:", mongoose.connection.readyState);



app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream }));
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
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


import admin_route from './router/adminRoute';
import {user_route} from './router/userRoute';
import host_route from './router/hostRoute';
import order_route from './router/orderRoute';
import chat_route from './router/chatRoute';
import hostel_route from './router/hostelRoute';
import wallet_route from './router/walletRoute';
import wishlist_route from './router/wishlistRoute';
import chatService from './service/chatService';
import chatRepository from './respository/chatRepository';

app.use('/admin', admin_route);
app.use('/user', user_route);
app.use('/host', host_route);
app.use('/order', order_route);
app.use('/chat', chat_route);
app.use('/hostel',hostel_route);
app.use('/wallet',wallet_route);
app.use('/wishlist',wishlist_route);


const ChatRepository = new chatRepository
const ChatService = new chatService(ChatRepository);
initializeSocket(server,ChatService);


server.listen(4000, () => {
    console.log("Server is listening on port 4000");
});