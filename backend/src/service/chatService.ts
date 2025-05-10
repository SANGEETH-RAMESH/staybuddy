import { Types } from "mongoose"
import { IChatRepository } from "../interface/chat/IChatRepository"
import { IChat } from "../model/chatModel"
import { IChatService } from "../interface/chat/IChatService"
import { IMessage } from "../model/messageModel"


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

    async handleSendMessage(messageData: { senderId: string, receiverId: string, message: string, timestamp: number; }): Promise<IMessage | string> {
        try {
            const savedMessage = await this.chatRepository.saveMessage(messageData)
            return savedMessage
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    async getOldChat(chatId:string):Promise<IMessage[] | null | string>{
        try {
            const getChatHistory = await this.chatRepository.getHistory(chatId)
            return getChatHistory
        } catch (error) {
            return error as string
        }
    }
}

export default chatService