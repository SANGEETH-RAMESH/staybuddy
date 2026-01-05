import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlist extends Document {
    image: string;
    hostelname: string;
    category: string;
    price: number;
    isActive: boolean;
    user_id: mongoose.Types.ObjectId; // optional: to link wishlist to a specific user
    hostel_id: mongoose.Types.ObjectId; // optional: to reference original hostel
}

const wishlistSchema: Schema = new Schema(
    {
        image: {
            type: String,
            required: true,
        },
        hostelname: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hostel_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
        },
    },
    { timestamps: true }
);

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);

export default Wishlist;