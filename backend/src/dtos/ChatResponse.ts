import mongoose from "mongoose";

export interface IChatResponse{
    participant1:mongoose.Types.ObjectId;
    participant2:mongoose.Types.ObjectId;
    latestMessage?:string;
    type:string;
    readCount?:number;
}