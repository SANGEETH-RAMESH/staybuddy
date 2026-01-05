import mongoose, { Document, Schema, Types } from "mongoose";

export interface IReview extends Document {
    orderId: Types.ObjectId;
    userId: Types.ObjectId;
    hostelId: Types.ObjectId;
    rating: number;
    review: string;
}

const reviewSchema: Schema = new Schema(
    {
        orderId: {
            type: Types.ObjectId,
            ref: "Order",
            required: true,
        },
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        hostelId: {
            type: Types.ObjectId,
            ref: "Hostel",
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;