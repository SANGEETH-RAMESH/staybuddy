import { Types } from "mongoose";
import { IChatRepository } from "../interface/chat/IChatRepository"
import Chat from "../model/chatModel"
import Message, { IMessage } from "../model/messageModel";
import { Messages } from "../messages/messages";
import { IChatResponse } from "../dtos/ChatResponse";




class chatRepository implements IChatRepository {
    constructor() { }

    async createChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse | string> {
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
                return Messages.ChatCreated;
            } else {
                return Messages.AlreadyChatCreated;
            }

        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getChat(userId: Types.ObjectId, ownerId: Types.ObjectId): Promise<IChatResponse[] | string> {
        try {
            const chat = await Chat.find({
                $or: [
                    { participant1: userId },
                    { participant2: userId }
                ]
            }).populate('participant2').sort({ updatedAt: -1 })
            if (!chat) {
                return Messages.NoChatFound
            }
            return chat
        } catch (error) {
            console.log(error)
            return error as string
        }
    }


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

    async getHostChat(hostId: string): Promise<IChatResponse[] | string> {
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

    async getUserChats(userId: string): Promise<IChatResponse[] | string> {
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
                return Messages.ChatCreated;
            } else {
                return Messages.AlreadyChatCreated;
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
            return Messages.CountUpdated;
        } catch (error) {
            return error as string
        }
    }
}

export default chatRepository