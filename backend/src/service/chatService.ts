import { Types } from "mongoose"
import { IChatRepository } from "../interface/chat/IChatRepository"
import { IChat } from "../model/chatModel"
import { IChatService } from "../interface/chat/IChatService"
import { IMessage } from "../model/messageModel"
import uploadImage from "../cloudinary/cloudinary"


class chatService implements IChatService {
    constructor(private chatRepository: IChatRepository) { }

    async createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | string> {
        try {
            const response = await this.chatRepository.createChat(userId, ownerId)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat[] | string> {
        try {
            const response = await this.chatRepository.getChat(userId, ownerId)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async handleSendMessage(messageData: {
        senderId: string, receiverId: string, message: string, timestamp: number;
        type: 'text' | 'image' | 'document';
        fileUrl?: string;
    }): Promise<IMessage | string> {
        try {
            console.log(messageData.type,'Typee')
            if (messageData.type !== 'text') {
                const base64Data = messageData.message.split(',')[1];
                const fileBuffer = Buffer.from(base64Data, 'base64');
                const uploadedUrl = await uploadImage(fileBuffer);
                messageData.message = uploadedUrl;
            }
            const savedMessage = await this.chatRepository.saveMessage(messageData)
            return savedMessage
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getOldChat(chatId: string): Promise<IMessage[] | null | string> {
        try {
            const getChatHistory = await this.chatRepository.getHistory(chatId)
            return getChatHistory
        } catch (error) {
            return error as string
        }
    }

    async getHostChat(hostId: string): Promise<IChat[] | string> {
        try {
            const response = await this.chatRepository.getHostChat(hostId)
            return response

        } catch (error) {
            return error as string
        }
    }

    async getUserChats(userId:string):Promise<IChat[] | string>{
        try {
            const response = await this.chatRepository.getUserChats(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async createHostChat(hostId:string,userId:string):Promise<string>{
        try {
            const response = await this.chatRepository.createHostChat(hostId,userId);
            return response
        } catch (error) {
            return error as string;
        }
    }
}

export default chatService