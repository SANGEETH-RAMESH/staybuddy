import { Types } from "mongoose";
import { IOrderResponse } from "../../dtos/OrderResponse";
import { reviewData } from "../../dtos/ReviewData";



export interface IOrderService {
    userBookings(OrderData: IOrderResponse): Promise<string>,
    getOrderDetails(id: Types.ObjectId): Promise<IOrderResponse | string | null>,
    endBooking(data: { orderId: Types.ObjectId, userId: Types.ObjectId }): Promise<string>,
    createReview(data: reviewData): Promise<string>,
    getReviewDetails(orderId: Types.ObjectId): Promise<reviewData[] | string | null>,
    getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<reviewData | string | null>,
    getSavedBookings(id: Types.ObjectId, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null>,
    getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null>,
    getBookingByOrder(hostelId: string): Promise<IOrderResponse[] | string>,
    verifyPayment(bookingId:string): Promise<string>,
    paymentFailed(bookingId:string):Promise<string>,
    repaymentSuccess(id: string): Promise<string>
}