import { Types } from "mongoose";
import { IChat } from "../../model/chatModel";
import { IMessage } from "../../model/messageModel";

export interface IChatRepository {
    // findChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | null>;
    createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | string>,
    saveMessage(messageData: { senderId: string, receiverId: string, message: string, timestamp: number; }): Promise<IMessage | string>,
    getChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChat[] | string>,
    getHistory(chatId:string):Promise<IMessage[] | null | string>
}