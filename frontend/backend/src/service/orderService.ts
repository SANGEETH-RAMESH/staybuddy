import mongoose, { Types } from "mongoose";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import { IOrderService } from "../interface/order/!OrderService";
import { ObjectId } from "mongodb";
import { Messages } from "../messages/messages";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import { IOrderResponse } from "../dtos/OrderResponse";
import { reviewData } from "../dtos/ReviewData";




class OrderService implements IOrderService {
    constructor(private _orderRepository: IOrderRepository, private _walletRepository: IWalletRepository) { }


    async userBookings(orderData: IOrderResponse): Promise<string> {
        try {
            const foodRate = orderData.foodRate ?? 0;
            const amount = orderData.totalDepositAmount + orderData.totalRentAmount + foodRate;
            const response = await this._orderRepository.orderBookings(orderData);
            console.log(orderData.host_id, 'HOstId in service')
            await this._walletRepository.creditHostWallet(orderData.host_id, amount)
            if (orderData.paymentMethod == 'wallet') {
                // const foodRate = orderData.foodRate?orderData.foodRate : 0;
                // const amount = orderData.totalDepositAmount + orderData.totalRentAmount + foodRate
                const id = new ObjectId(orderData.userId)
                await this._walletRepository.debitUserWallet(id, amount);

                return response
            }
            return response
        } catch (error) {
            return error as string
        }
    }

    async getOrderDetails(id: Types.ObjectId): Promise<IOrderResponse | string | null> {
        try {
            const response = await this._orderRepository.getOrderDetails(id);
            return response
        } catch (error) {
            return error as string
        }
    }

    async endBooking(data: { orderId: Types.ObjectId, userId: Types.ObjectId, cancellationStatus: string }): Promise<string> {
        try {
            const response = await this._orderRepository.getOrderDetails(data.orderId);
            if (!response || typeof response === "string") {
                return Messages.NoOrder;
            }
            const hostId = response.host_id._id
            const amount = response?.totalDepositAmount
            const updateStatusOrder = await this._orderRepository.updatingOrderStatus(data.orderId)
            let userWalletCredit: string = Messages.Skipped;
            let hostWalletDebit: string = Messages.Skipped;
            userWalletCredit = await this._walletRepository.creditUserWallet(data?.userId, data.orderId, data.cancellationStatus)

            if (data.cancellationStatus == Messages.Available) {
                hostWalletDebit = await this._walletRepository.debitHostWallet(hostId, amount)

                if (userWalletCredit !== Messages.WalletUpdatedSuccessfully || hostWalletDebit !== Messages.WalletUpdatedSuccessfully) {
                    return Messages.WalletUpdateFailed;
                }
            }

            const beds = response.selectedBeds;

            const hostelId = (response.hostel_id as any).toString();
            await this._orderRepository.updateRoom(hostelId, beds)
            return Messages.Updated
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async createReview(data: reviewData): Promise<string> {
        try {
            const response = await this._orderRepository.createReview(data);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getReviewDetails(orderId: Types.ObjectId): Promise<reviewData[] | string | null> {
        try {
            const response = await this._orderRepository.getReviewDetails(orderId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<reviewData | string | null> {
        try {
            const response = await this._orderRepository.getReviewDetailsByOrderId(orderId);
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getSavedBookings(id: Types.ObjectId, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null> {
        try {
            const response = await this._orderRepository.getSavedBookings(id, skip, limit);
            return response
        } catch (error) {
            return error as string;
        }
    }

    async getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null> {
        try {
            const response = await this._orderRepository.getBookings(hostId, skip, limit)
            return response
        } catch (error) {
            return error as string
        }
    }

    async getBookingByOrder(hostelId: string): Promise<IOrderResponse[] | string> {
        try {
            const response = await this._orderRepository.getBookingByOrder(hostelId);
            return response;
        } catch (error) {
            return error as string
        }
    }

    async verifyPayment(bookingId: string): Promise<string> {
        try {
            const response = await this._orderRepository.verifyPayment(bookingId);
            const orderId = new mongoose.Types.ObjectId(bookingId);
            console.log(orderId,"ORderrrrId");
            const getOrderDetails = await this._orderRepository.getOrderDetails(orderId);
            console.log(getOrderDetails,'dfdfdf')
            console.log(typeof getOrderDetails)
            if (!getOrderDetails) {
                return Messages.NoOrder
            }
            if(typeof getOrderDetails == "string"){
                return Messages.NoOrder;
            }
            const foodRate = getOrderDetails.foodRate ?? 0;
            const amount = getOrderDetails.totalDepositAmount + getOrderDetails.totalRentAmount + foodRate;
            await this._walletRepository.creditHostWallet(getOrderDetails.host_id, amount)
            return response;
        } catch (error) {
            return error as string
        }
    }

    async paymentFailed(bookingId: string): Promise<string> {
        try {
            const response = await this._orderRepository.paymentFailed(bookingId);
            return response
        } catch (error) {
            return error as string
        }
    }

    async repaymentSuccess(id: string): Promise<string> {
        try {
            const response = await this._orderRepository.repaymentSuccess(id);
            console.log(response,"dd",id)
            const orderId = new mongoose.Types.ObjectId(id);
            console.log(orderId,"ORderrrrId");
            const getOrderDetails = await this._orderRepository.getOrderDetails(orderId);
            console.log(getOrderDetails,'dfdfdf')
            console.log(typeof getOrderDetails)
            if (!getOrderDetails) {
                return Messages.NoOrder
            }
            if(typeof getOrderDetails == "string"){
                return Messages.NoOrder;
            }
            const foodRate = getOrderDetails.foodRate ?? 0;
            const amount = getOrderDetails.totalDepositAmount + getOrderDetails.totalRentAmount + foodRate;
            await this._walletRepository.creditHostWallet(getOrderDetails.host_id, amount)
            return response;
        } catch (error) {
            return error as string;
        }
    }
}


export default OrderService