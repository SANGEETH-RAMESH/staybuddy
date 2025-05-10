import { Types } from "mongoose";
import { IChat } from "../../model/chatModel";
import { IMessage } from "../../model/messageModel";

export interface IChatService {
    createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat| string>,
    getChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChat[] | string>,
    handleSendMessage(messageData: {senderId: string,receiverId: string,message: string,timestamp: number;}): Promise<IMessage | string>,
    getOldChat(chatId:string):Promise<IMessage[] | null | string>
}