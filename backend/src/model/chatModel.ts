import mongoose,{Document,Schema} from "mongoose";

export interface IChat extends Document{
    participant1:mongoose.Types.ObjectId;
    participant2:mongoose.Types.ObjectId;
    latestMessage?:mongoose.Types.ObjectId;
}

const chatSchema: Schema = new Schema(
    {
        participant1: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participant2: {
            type: Schema.Types.ObjectId,
            ref: 'Host',
            required: true,
        },
        latestMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            default: null, 
        },
    },
    { timestamps: true }
);

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
