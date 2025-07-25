import { Types } from "mongoose";
import { IChatRepository } from "../interface/chat/IChatRepository"
import Chat, { IChat } from "../model/chatModel"
import Message, { IMessage } from "../model/messageModel";




class chatRepository implements IChatRepository {
    constructor() { }

    async createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat | string> {
        try {
            const existingChat = await Chat.findOne({
                $or: [
                    { participant1: userId, participant2: ownerId },
                    { participant1: ownerId, participant2: userId }
                ]
            })

            if (!existingChat) {
                const chat = new Chat({
                    participant1: userId,
                    participant2: ownerId,
                    latestMessage: null,
                });

                await chat.save();
                return 'Chat Created'
            } else {
                return 'Already Created'
            }

        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChat[] | string> {
        try {
            const chat = await Chat.find({
                $or: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            }).populate('participant2').sort({ updatedAt: -1 })
            if (!chat) {
                return 'No chat found'
            }
            return chat
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    // async getHostChat(hostId:Types.ObjectId,userId:Types.ObjectId):Promise<IChat[] | string | null>{
    //     try {
    //         const chat = await Chat.find([  ])
    //     } catch (error) {

    //     }
    // }

    async saveMessage(messageData: {
        senderId: string;
        receiverId: string;
        message: string;
        timestamp: number;
        chatId: string;
        type: 'text' | 'image' | 'document';
        fileUrl?: string;
    }): Promise<{ savedMessage: IMessage; readCount: number } | string> {
        try {
            console.log("Hey",messageData,'dfljsdflsjfdsf')
            const storedMessage = messageData.message;

            const newMessage = new Message({
                chatId: messageData.chatId,
                senderId: messageData.senderId,
                receiverId: messageData.receiverId,
                message: storedMessage,
                timestamp: new Date(messageData.timestamp),
                type: messageData.type,
                fileUrl: messageData.type !== 'text' ? messageData.fileUrl : undefined
            });

            const updatedChat = await Chat.findOneAndUpdate(
                {
                    $or: [
                        { participant1: messageData.senderId, participant2: messageData.receiverId },
                        { participant1: messageData.receiverId, participant2: messageData.senderId }
                    ]
                },
                {
                    $set: {
                        latestMessage: storedMessage,
                        updatedAt: new Date(messageData.timestamp),
                        type: messageData.type,
                    },
                    $inc: {
                        readCount: 1
                    }
                },
                { new: true }
            );
            const getChat = await Chat.findOne({
                $or: [
                    { participant1: messageData.senderId, participant2: messageData.receiverId },
                    { participant1: messageData.receiverId, participant2: messageData.senderId }
                ]
            })
            const savedMessage = await newMessage.save();

            return {
                savedMessage,
                readCount: getChat?.readCount ?? 0
            };
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async getHistory(chatId: string): Promise<IMessage[] | null | string> {
        try {
            const getMessage = await Message.find({ chatId: chatId });
            return getMessage
        } catch (error) {
            return error as string
        }
    }

    async getHostChat(hostId: string): Promise<IChat[] | string> {
        try {
            const getChat = await Chat.find({
                $or: [
                    { participant1: hostId },
                    { participant2: hostId }
                ]
            }).populate('participant1').sort({ updatedAt: -1 })
            return getChat
        } catch (error) {
            return error as string
        }
    }

    async getUserChats(userId: string): Promise<IChat[] | string> {
        try {
            const getChat = await Chat.find({
                $or: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            })
                .populate('participant2')
                .populate('participant1')
                .sort({ updatedAt: -1 })
            return getChat;
        } catch (error) {
            return error as string
        }
    }



    async createHostChat(hostId: string, userId: string): Promise<string> {
        try {
            const existingChat = await Chat.findOne({
                $or: [
                    { participant1: userId, participant2: hostId },
                    { participant1: hostId, participant2: userId }
                ]
            })

            if (!existingChat) {
                const chat = new Chat({
                    participant1: userId,
                    participant2: hostId,
                    latestMessage: null,
                });

                await chat.save();
                return 'Chat Created'
            } else {
                return 'Already Created'
            }
        } catch (error) {
            return error as string;
        }
    }

    async setCountRead(chatId: string): Promise<string> {
        try {
            const countRead = await Chat.updateOne(
                { _id: chatId },
                {
                    $set: {
                        readCount: 0
                    }
                }
            );
            return 'Count Updated'
        } catch (error) {
            return error as string
        }
    }
}

export default chatRepository