import mongoose, { Document, Schema, Types } from "mongoose";

export interface IOrder extends Document {
    category: string;
    userId: Types.ObjectId;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    foodRate: number | null;
    host_id: Types.ObjectId;
    hostel_id: Types.ObjectId;
    name: string,
    location: string,
    host_mobile: string,
    nearbyaccess: string,
    policies: string,
    advanceamount: number,
    bedShareRoom: number,
    photos: string[],
    selectedBeds: number;
    selectedFacilities: {
        wifi: boolean;
        laundry: boolean;
        food: boolean;
    };
    tenantPreferred: string;
    totalDepositAmount: number;
    totalRentAmount: number;
    paymentMethod: "online" | "wallet";
    active: boolean,
    startDate: Date,
    endDate: Date,
    cancellationPolicy:string,
    cancelled:boolean
}

const orderSchema: Schema = new Schema(
    {
        category: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        customerEmail: {
            type: String,
            required: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerPhone: {
            type: String,
            required: true,
        },
        foodRate: {
            type: Number,
            default: null,
        },
        host_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Host',
            required: true,
        },
        hostel_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hostel',
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        host_mobile: {
            type: String,
            required: true,
        },
        nearbyaccess: {
            type: String,
            required: true
        },
        policies: {
            type: String,
            required: true
        },
        advanceamount: {
            type: Number,
            required: true
        },
        bedShareRoom: {
            type: Number,
            required: true
        },
        photos: {
            type: [String],
            required: true
        },
        selectedBeds: {
            type: Number,
            required: true,
        },
        selectedFacilities: {
            wifi: {
                type: Boolean,
                required: true,
            },
            laundry: {
                type: Boolean,
                required: true,
            },
            food: {
                type: Boolean,
                required: true,
            },
        },
        tenantPreferred: {
            type: String,
            required: true,
        },
        totalDepositAmount: {
            type: Number,
            required: true,
        },
        totalRentAmount: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ["online", "wallet"],
            required: true,
        },
        active: {
            type: Boolean,
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        cancellationPolicy:{
            type:String,
            required:true
        },
        cancelled:{
            type:Boolean,
            default:false
        }
    },
    { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
