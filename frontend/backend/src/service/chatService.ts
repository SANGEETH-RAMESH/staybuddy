import { Types } from "mongoose"
import { IChatRepository } from "../interface/chat/IChatRepository"
import { IChatService } from "../interface/chat/IChatService"
import uploadImage from "../cloudinary/cloudinary"
import { IMessageResponse } from "../dtos/MessageResponse"
import { IChatResponse } from "../dtos/ChatResponse"


class chatService implements IChatService {
    constructor(private _chatRepository: IChatRepository) { }

    async createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse | string> {
        try {
            const response = await this._chatRepository.createChat(userId, ownerId)
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse[] | string> {
        try {
            const response = await this._chatRepository.getChat(userId, ownerId)
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
    }): Promise<{ savedMessage: IMessageResponse; readCount: number } | string> {
        try {
            if (messageData.type !== 'text') {
                const base64Data = messageData.message.split(',')[1];
                const fileBuffer = Buffer.from(base64Data, 'base64');
                const uploadedUrl = await uploadImage(fileBuffer);
                messageData.message = uploadedUrl;
            }
            const savedMessage = await this._chatRepository.saveMessage(messageData)
            return savedMessage
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getOldChat(chatId: string): Promise<IMessageResponse[] | null | string> {
        try {
            const getChatHistory = await this._chatRepository.getHistory(chatId)
            return getChatHistory
        } catch (error) {
            return error as string
        }
    }

    async getHostChat(hostId: string): Promise<IChatResponse[] | string> {
        try {
            const response = await this._chatRepository.getHostChat(hostId)
            return response

        } catch (error) {
            return error as string
        }
    }

    async getUserChats(userId: string): Promise<IChatResponse[] | string> {
        try {
            const response = await this._chatRepository.getUserChats(userId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async createHostChat(hostId: string, userId: string): Promise<string> {
        try {
            const response = await this._chatRepository.createHostChat(hostId, userId);
            return response
        } catch (error) {
            return error as string;
        }
    }

    async setCountRead(chatId: string): Promise<string> {
        try {
            const response = await this._chatRepository.setCountRead(chatId);
            return response
        } catch (error) {
            return error as string
        }
    }
}

export default chatService