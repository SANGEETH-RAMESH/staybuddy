import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    chatId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    message: string;
    imageUrl:string;
    type:'text' | 'document' | 'image';
    isRead?: boolean;
    timestamp?: Date;
}

const messageSchema: Schema = new Schema(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'Host',
            required: true,
        },
        message: {
            type: String,
            default: null,
        },
        imageUrl:{
            type:String,
            default:null
        },
        type:{
            type:String,
            enum:['text','image','document']
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
