import mongoose, { Types } from "mongoose";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import Hostel from "../model/hostelModel";
// import { IHost } from "../model/hostModel";
import { IOrder } from "../model/orderModel";
import Order from "../model/orderModel";
import Wallet from "../model/walletModel";
import { ObjectId } from 'mongodb'
import Review, { IReview } from "../model/reviewModel";

interface HostelData {
    _id: Types.ObjectId,
    name: string,
    email: string,
    password: string,
    mobile: string,
    isBlock: boolean,
    temp: boolean,
    approvalRequest: string
    phone: number
}

interface reviewData {
    orderId: string,
    rating: number,
    review: string,
    hostelId: string,
    userId: string
}

class orderRepository implements IOrderRepository {
    constructor() {

    }


    async orderBookings(orderData: IOrder): Promise<string> {
        try {
            console.log(orderData,'OrderDate')
            const findHostel = await Hostel.findOne({ _id: orderData.hostel_id }).populate<{ host_id: HostelData }>('host_id');
            if (!findHostel) {
                throw new Error('Hostel not found');
            }
            const host = findHostel?.host_id;
            const hostelid = findHostel._id as ObjectId;
            const hostId = new mongoose.Types.ObjectId(orderData.host_id);
            const user_id = new mongoose.Types.ObjectId(orderData.userId);
            const paymentMethod = orderData.paymentMethod == 'wallet' ? 'wallet' : 'online'
            const addBookings = new Order({
                category: orderData.category,
                userId: user_id,
                customerEmail: orderData.customerEmail,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                foodRate: orderData.foodRate,
                host_id: hostId,
                hostel_id: hostelid,
                name: findHostel.hostelname,
                location: findHostel.location,
                host_mobile: host.mobile,
                nearbyaccess: findHostel.nearbyaccess,
                policies: findHostel.policies,
                advanceamount: findHostel.advanceamount,
                bedShareRoom: findHostel.bedShareRoom,
                photos: findHostel.photos,
                selectedBeds: orderData.selectedBeds,
                selectedFacilities: orderData.selectedFacilities,
                tenantPreferred: orderData.tenantPreferred,
                totalDepositAmount: orderData.totalDepositAmount,
                totalRentAmount: orderData.totalRentAmount,
                paymentMethod: paymentMethod,
                active: true,
                startDate: orderData.startDate,
                endDate: orderData.endDate,
                cancellationPolicy:orderData.cancellationPolicy
            });
            if (addBookings) {
                await Hostel.updateOne(
                    { _id: hostelid },
                    { $inc: { beds: -orderData.selectedBeds } }
                )
            }
            await addBookings.save();
            return "Hostel Booked"
        } catch (error) {
            return error instanceof Error ? error.message : String(error);
        }
    }

    async debitUserWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: -amount },
                    $push: {
                        transactionHistory: {
                            type: "withdrawal",
                            amount: amount,
                            date: new Date(),
                            description: `Debited ${amount} from wallet`
                        }
                    }
                });

            return 'Wallet updated successfully'
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getOrderDetails(id: Types.ObjectId): Promise<IOrder | string | null> {
        try {
            const findOrder = await Order.findOne({ _id: id }).populate('host_id');
            return findOrder
        } catch (error) {
            return error as string
        }
    }

    async creditUserWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: amount },
                    $push: {
                        transactionHistory: {
                            type: "deposit",
                            amount: amount,
                            date: new Date(),
                            description: `Credited ${amount} to wallet`
                        }
                    }
                });

            return 'Wallet updated successfully'
        } catch (error) {
            console.log(error);
            return error as string
        }
    }


    async debitHostWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: -amount },
                    $push: {
                        transactionHistory: {
                            type: "withdraw",
                            amount: amount,
                            date: new Date(),
                            description: `Debited ${amount} from wallet`
                        }
                    }
                });

            return 'Wallet updated successfully'
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async createReview(data: reviewData): Promise<string> {
        try {
            const newReview = new Review({
                orderId: data.orderId,
                rating: data.rating,
                review: data.review,
                hostelId: data.hostelId,
                userId: data.userId
            })
            await newReview.save();
            return "Review Created"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<IReview | string | null> {
        try {
            const findReview = await Review.findOne({ orderId: orderId }).populate('userId')
            return findReview
        } catch (error) {
            return error as string
        }
    }

    async getReviewDetails(hostelId: Types.ObjectId): Promise<IReview[] | string | null> {
        try {
            const review = await Review.find()
            const findReview = await Review.find({ hostelId: hostelId }).populate('userId')
            return findReview
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async updatingOrderStatus(orderId: Types.ObjectId): Promise<string> {
        try {
            const orderFind = await Order.findOne({ _id: orderId })
            await Order.updateOne(
                { _id: orderId },
                { $set: { active: false,cancelled:true } }
            )
            return "Updated"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async updateRoom(hostelId: string, bedCount: number): Promise<string> {
        try {
            const updatingRoom = await Hostel.updateOne(
                { _id: hostelId },
                { $inc: { beds: bedCount } }
            )
            return "Room Updated"
        } catch (error) {
            return error as string
        }
    }

    async getSavedBookings(id: Types.ObjectId, skip: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null> {
        try {
            const skipnumber = parseInt(skip, 0);
            const limitNumber = parseInt(limit, 10);
            if (isNaN(skipnumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }
            const totalCount = await Order.countDocuments({ userId: id });
            const bookings = await Order.find({ userId: id })
                .populate('host_id')
                .populate('userId')
                .sort({ updatedAt: -1 })
                .skip(skipnumber)
                .limit(limitNumber);

            return { bookings, totalCount };
        } catch (error) {
            return error as string
        }
    }

    async getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrder[]; totalCount: number } | string | null> {
        try {
            const skipnumber = parseInt(skip, 0);
            const limitNumber = parseInt(limit, 10);
            if (isNaN(skipnumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }
            const getBookings = await Order.find({ host_id: hostId })
                .sort({ updatedAt: -1 })
                .skip(skipnumber)
                .limit(limitNumber)
                .populate("host_id")
                .populate("userId")
            const totalCount = await Order.countDocuments({ host_id: hostId });
            return { bookings: getBookings, totalCount };
        } catch (error) {
            return error as string
        }
    }

    async getBookingByOrder(hostelId: string): Promise<IOrder[] | string> {
        try {
            console.log(hostelId)
            const orders = await Order.find({ hostel_id: hostelId })
            return orders;
        } catch (error) {
            return error as string
        }
    }
}


export default orderRepository