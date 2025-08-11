import { Types } from "mongoose";

export interface IOrderResponse   {
    _id:string | Types.ObjectId;
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
    cancellationPolicy: string,
    cancelled: boolean,
    status: string,
    razorpay_order_id?: string
}