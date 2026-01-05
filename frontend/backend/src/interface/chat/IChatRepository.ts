import { Types } from "mongoose";
import { IChat } from "../../model/chatModel";
import { IMessage } from "../../model/messageModel";
import { IChatResponse } from "../../dtos/ChatResponse";

export interface IChatRepository {
    createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse | string>,
    saveMessage(messageData: { senderId: string, receiverId: string, message: string, timestamp: number; }): Promise<{ savedMessage: IMessage; readCount: number } | string>,
    getChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse[] | string>,
    getHistory(chatId: string): Promise<IMessage[] | null | string>,
    getHostChat(hostId: string): Promise<IChatResponse[] | string>,
    getUserChats(userId: string): Promise<IChatResponse[] | string>,
    createHostChat(hostId: string, userId: string): Promise<string>,
    setCountRead(chatId: string): Promise<string>

}