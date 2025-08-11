import mongoose from "mongoose";

export interface IMessageResponse {
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    message: string;
    imageUrl:string;
    type:'text' | 'document' | 'image';
    isRead?: boolean;
    timestamp?: Date;
}