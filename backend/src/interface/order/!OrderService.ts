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

export interface IOrderService{
    userBookings(OrderData:IOrder):Promise<string>,
    getOrderDetails(id:Types.ObjectId):Promise<IOrder | string | null>,
    endBooking(data:{orderId:Types.ObjectId,userId:Types.ObjectId}):Promise<string>,
    createReview(data:reviewData):Promise<string>,
    getReviewDetails(orderId:Types.ObjectId):Promise<IReview[] | string | null>,
    getReviewDetailsByOrderId(orderId:Types.ObjectId):Promise<IReview | string | null>
}