import { Types } from "mongoose";
import { IMessageResponse } from "../../dtos/MessageResponse";
import { IChatResponse } from "../../dtos/ChatResponse";

export interface IChatService {
    createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse| string>,
    getChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChatResponse[] | string>,
    handleSendMessage(messageData: {senderId: string,receiverId: string,message: string,timestamp: number}):  Promise<{ savedMessage: IMessageResponse; readCount: number } | string> ,
    getOldChat(chatId:string):Promise<IMessageResponse[] | null | string>,
    getHostChat(hostId: string): Promise<IChatResponse[] | string>,
    getUserChats(userId:string):Promise<IChatResponse[] | string>,
    createHostChat(hostId: string, userId: string): Promise<string>,
    setCountRead(chatId:string):Promise<string>
}