import { Types } from "mongoose";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import { IOrderService } from "../interface/order/!OrderService";
import { IOrder } from "../model/orderModel";
// import Wallet from "../model/walletModel";
import { ObjectId } from "mongodb";
import { IReview } from "../model/reviewModel";


interface reviewData {
    orderId: string,
    rating: number,
    review: string,
    hostelId: string,
    userId: string
}



class OrderService implements IOrderService {
    constructor(private orderRepository: IOrderRepository) { }


    async userBookings(orderData: IOrder): Promise<string> {
        try {
            const foodRate = orderData.foodRate ?? 0;
            const amount = orderData.totalDepositAmount + orderData.totalRentAmount + foodRate;
            const response = await this.orderRepository.orderBookings(orderData);
            await this.orderRepository.creditUserWallet(orderData.host_id, amount)
            if (orderData.paymentMethod == 'wallet') {
                // const foodRate = orderData.foodRate?orderData.foodRate : 0;
                // const amount = orderData.totalDepositAmount + orderData.totalRentAmount + foodRate
                const id = new ObjectId(orderData.userId)
                await this.orderRepository.debitUserWallet(id, amount);

                return response
            }
            return response
        } catch (error) {
            return error as string
        }
    }

    async getOrderDetails(id: Types.ObjectId): Promise<IOrder | string | null> {
        try {
            const response = await this.orderRepository.getOrderDetails(id);
            return response
        } catch (error) {
            return error as string
        }
    }

    async endBooking(data: { orderId: Types.ObjectId, userId: Types.ObjectId, cancellationStatus: string }): Promise<string> {
        try {
            const response = await this.orderRepository.getOrderDetails(data.orderId);
            if (!response || typeof response === "string") {
                return "No order"
            }
            const hostId = response.host_id._id
            const amount = response?.totalDepositAmount
            const updateStatusOrder = await this.orderRepository.updatingOrderStatus(data.orderId)
            let userWalletCredit: string = "skipped";
            let hostWalletDebit: string = "skipped";
            if (data.cancellationStatus == 'available') {
                userWalletCredit = await this.orderRepository.creditUserWallet(data?.userId, amount)
                hostWalletDebit = await this.orderRepository.debitHostWallet(hostId, amount)

                if (userWalletCredit !== 'Wallet updated successfully' || hostWalletDebit !== 'Wallet updated successfully') {
                    return "Wallet update failed";
                }
            }

            const beds = response.selectedBeds;

            const hostelId = (response.hostel_id as any).toString();
            await this.orderRepository.updateRoom(hostelId, beds)
            return 'Updated'
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async createReview(data: reviewData): Promise<string> {
        try {
            const response = await this.orderRepository.createReview(data);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getReviewDetails(orderId: Types.ObjectId): Promise<IReview[] | string | null> {
        try {
            const response = await this.orderRepository.getReviewDetails(orderId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<IReview | string | null> {
        try {
            const response = await this.orderRepository.getReviewDetailsByOrderId(orderId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getSavedBookings(id: Types.ObjectId, skip: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null> {
        try {
            const response = await this.orderRepository.getSavedBookings(id, skip, limit);
            return response
        } catch (error) {
            return error as string;
        }
    }

    async getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null> {
        try {
            const response = await this.orderRepository.getBookings(hostId, skip, limit)
            return response
        } catch (error) {
            return error as string
        }
    }

    async getBookingByOrder(hostelId: string): Promise<IOrder[] | string> {
        try {
            const response = await this.orderRepository.getBookingByOrder(hostelId);
            return response;
        } catch (error) {
            return error as string
        }
    }
}


export default OrderService