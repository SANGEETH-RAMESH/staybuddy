import { Types } from "mongoose";
import { IChat } from "../../model/chatModel";
import { IMessage } from "../../model/messageModel";

export interface IChatRepository {
    // findChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | null>;
    createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | string>,
    saveMessage(messageData: { senderId: string, receiverId: string, message: string, timestamp: number; }): Promise<{ savedMessage: IMessage; readCount: number } | string> ,
    getChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChat[] | string>,
    getHistory(chatId:string):Promise<IMessage[] | null | string>,
    getHostChat(hostId:string): Promise<IChat[] | string>,
    getUserChats(userId:string):Promise<IChat[] | string>,
    createHostChat(hostId: string, userId: string): Promise<string>,
     setCountRead(chatId:string):Promise<string>
    
}