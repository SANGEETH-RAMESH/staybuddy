import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    receiver?: mongoose.Types.ObjectId | null;
    receiverModel?: 'User' | 'Host' | null;
    message: string;
    type: string;
    title: string;
    isRead: boolean;
}

const notificationSchema: Schema = new Schema(
    {
        receiver: {
            type: Schema.Types.ObjectId,
            refPath: 'receiverModel',
            default: null
        },
        receiverModel: {
            type: String,
            enum: ['User', 'Host'],
            default: null
        },
        message: {
            type: String,
            required: true
        },
        type: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;