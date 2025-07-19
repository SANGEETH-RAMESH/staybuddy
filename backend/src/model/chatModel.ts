import mongoose,{Document,Schema} from "mongoose";

export interface IChat extends Document{
    participant1:mongoose.Types.ObjectId;
    participant2:mongoose.Types.ObjectId;
    latestMessage?:string;
    type:string;
    readCount?:number;
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
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
    readCount:{
      type:Number,
      default:0
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
