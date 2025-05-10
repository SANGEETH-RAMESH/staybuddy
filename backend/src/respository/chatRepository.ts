import { Types } from "mongoose";
import { IChatRepository } from "../interface/chat/IChatRepository"
import Chat, { IChat } from "../model/chatModel"
import Message, { IMessage } from "../model/messageModel";




class chatRepository implements IChatRepository{
    constructor() {} 

    async createChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChat| string>{
        try {
            const existingChat = await Chat.findOne({
                $or: [
                    { participant1: userId, participant2: ownerId },
                    { participant1: ownerId, participant2: userId }
                ]
            })

            if(!existingChat){
                const chat = new Chat({
                    participant1: userId,
                    participant2: ownerId,
                    latestMessage: null,
                });
        
              await chat.save();
              return 'Chat Created'
            }else{
                return 'Already Created'
            }
      
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getChat(userId: Types.ObjectId, ownerId: Types.ObjectId):Promise<IChat[] | string>{
        try {
            console.log(ownerId,'OwnerId')
            const chat = await Chat.find({
                $or:[
                    {participant1:userId},
                    {participant2:userId}
                ]
            }).populate('participant2')
            
            if(!chat){
                return 'No chat found'
            }

            return chat
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async saveMessage(messageData: { senderId: string, receiverId: string, message: string, timestamp: number; }): Promise<IMessage | string>{
        try {
            console.log(messageData,'Saving Message')
            const newMessage = new Message(messageData)
            
            return await newMessage.save();
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHistory(chatId:string):Promise<IMessage[] | null | string>{
        try {
            const getMessage = await Message.find({chatId:chatId});
            return getMessage
        } catch (error) {
            return error as string
        }
    }
}

export default chatRepository