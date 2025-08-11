import mongoose from "mongoose";

export interface INotificationResponse {
    receiver?: mongoose.Types.ObjectId | null;
    receiverModel?: 'User' | 'Host' | null;
    message: string;
    type: string;
    title: string;
    isRead: boolean;
}
