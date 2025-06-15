import mongoose from 'mongoose'

export interface Notification {
  _id?:string;
  sender?: mongoose.Types.ObjectId | string | null;
  senderModel?: 'User' | 'Host' | null;
  receiver?: mongoose.Types.ObjectId | string | null;
  receiverModel?: 'User' | 'Host' | null;
  message: string;
  type: string;
  title: string;
  isRead: boolean;
  createdAt?:string
}