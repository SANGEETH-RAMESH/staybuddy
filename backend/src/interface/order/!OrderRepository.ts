import { Types } from "mongoose";
import { IOrderResponse } from "../../dtos/OrderResponse";
import { reviewData } from "../../dtos/ReviewData";

export interface IOrderRepository {
    orderBookings(orderData: IOrderResponse): Promise<string>,
    getOrderDetails(id: Types.ObjectId): Promise<IOrderResponse | string | null>,
    createReview(data: reviewData): Promise<string>,
    getReviewDetails(orderId: Types.ObjectId): Promise<reviewData[] | string | null>,
    updatingOrderStatus(orderId: Types.ObjectId): Promise<string>,
    getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<reviewData | string | null>,
    updateRoom(hostelId: string, bedCount: number): Promise<string>,
    getSavedBookings(id: Types.ObjectId, page: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null>,
    getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null>,
    getBookingByOrder(hostelId: string): Promise<IOrderResponse[] | string>,
    verifyPayment(bookingId:string): Promise<string>,
    paymentFailed(bookingId:string):Promise<string>,
    repaymentSuccess(id: string): Promise<string>,
    getSales(): Promise<IOrderResponse[] | string | null>

}