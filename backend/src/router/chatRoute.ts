import { Router } from "express";
import ChatRepository from "../respository/chatRepository";
import ChatService from "../service/chatService";
import ChatController from "../controller/chatController";
import userAuthMiddleware from '../middleware/userAuth';


const chat_route = Router()
const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository)
const chatController = new ChatController(chatService)

chat_route.post('/createchat', userAuthMiddleware, chatController.createChat.bind(chatController));
chat_route.get('/getChat',userAuthMiddleware,chatController.getChat.bind(chatController))

export default chat_route