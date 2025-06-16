import { Types } from "mongoose";
import { IOrder } from "../../model/orderModel";
import { IReview } from "../../model/reviewModel";


interface reviewData{
    orderId:string,
    rating:number,
    review:string,
    hostelId:string,
    userId:string
}

export interface IOrderRepository{
    orderBookings(orderData:IOrder):Promise<string>,
    debitUserWallet(id:Types.ObjectId,amount:number):Promise<string>,
    getOrderDetails(id:Types.ObjectId):Promise<IOrder | string | null>,
    creditUserWallet(id:Types.ObjectId,amount:number):Promise<string>,
    debitHostWallet(id:Types.ObjectId,amount:number):Promise<string>,
    createReview(data:reviewData):Promise<string>,
    getReviewDetails(orderId:Types.ObjectId):Promise<IReview[] | string | null>,
    updatingOrderStatus(orderId:Types.ObjectId):Promise<string>,
    getReviewDetailsByOrderId(orderId:Types.ObjectId):Promise<IReview | string | null>,
    updateRoom(hostelId: string, bedCount: number): Promise<string>
}