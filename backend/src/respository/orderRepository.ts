import mongoose, { Types } from "mongoose";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import Hostel from "../model/hostelModel";
import { IOrder } from "../model/orderModel";
import Order from "../model/orderModel";
import { ObjectId } from 'mongodb'
import Review from "../model/reviewModel";
import { reviewData } from '../dtos/ReviewData';
import { IHostResponse } from "../dtos/HostResponse";
import { Messages } from "../messages/messages";
import { IOrderResponse } from "../dtos/OrderResponse";


class orderRepository implements IOrderRepository {
    constructor() {

    }


    async orderBookings(orderData: IOrderResponse): Promise<string> {
        try {
            const findHostel = await Hostel.findOne({ _id: orderData.hostel_id }).populate<{ host_id: IHostResponse }>('host_id');
            if (!findHostel) {
                throw new Error(Messages.HostelNotFound);
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
                cancellationPolicy: orderData.cancellationPolicy,
                status: 'paid',
            });
            if (addBookings) {
                await Hostel.updateOne(
                    { _id: hostelid },
                    { $inc: { beds: -orderData.selectedBeds } }
                )
            }
            await addBookings.save();
            return Messages.HostelBooked;
        } catch (error) {
            return error instanceof Error ? error.message : String(error);
        }
    }

    async getOrderDetails(id: Types.ObjectId): Promise<IOrderResponse | string | null> {
        try {
            const findOrder = await Order.findOne({ _id: id }).populate('host_id').lean<IOrderResponse>();
            return findOrder
        } catch (error) {
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
            return Messages.ReviewCreated;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getReviewDetailsByOrderId(orderId: Types.ObjectId): Promise<reviewData | string | null> {
        try {
            const findReview = await Review.findOne({ orderId: orderId }).populate('userId').lean<reviewData>();
            return findReview;
        } catch (error) {
            return error as string
        }
    }

    async getReviewDetails(hostelId: Types.ObjectId): Promise<reviewData[] | string | null> {
        try {
            const findReview = await Review.find({ hostelId: hostelId }).populate('userId').lean<reviewData[]>();
            return findReview;
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
                { $set: { active: false, cancelled: true, status: 'cancelled' } }
            )
            return Messages.Updated;
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
            return Messages.RoomUpdated;
        } catch (error) {
            return error as string
        }
    }

    async getSavedBookings(id: Types.ObjectId, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null> {
        try {
            const skipnumber = parseInt(skip, 0);
            const limitNumber = parseInt(limit, 10);
            if (isNaN(skipnumber) || isNaN(limitNumber)) {
                return Messages.InvalidPaginationValues;
            }
            const totalCount = await Order.countDocuments({ userId: id });
            const bookings = await Order.find({ userId: id })
                .populate('host_id')
                .populate('userId')
                .sort({ updatedAt: -1 })
                .skip(skipnumber)
                .limit(limitNumber)
                .lean<IOrderResponse[]>();
            return { bookings, totalCount };
        } catch (error) {
            return error as string
        }
    }

    async getBookings(hostId: string, skip: string, limit: string): Promise<{ bookings: IOrderResponse[]; totalCount: number } | string | null> {
        try {
            const skipnumber = parseInt(skip, 0);
            const limitNumber = parseInt(limit, 10);
            if (isNaN(skipnumber) || isNaN(limitNumber)) {
                return Messages.InvalidPaginationValues;
            }
            const getBookings = await Order.find({ host_id: hostId })
                .sort({ updatedAt: -1 })
                .skip(skipnumber)
                .limit(limitNumber)
                .populate("host_id")
                .populate("userId")
                .lean<IOrderResponse[]>();
            const totalCount = await Order.countDocuments({ host_id: hostId });
            return { bookings: getBookings, totalCount };
        } catch (error) {
            return error as string
        }
    }

    async getBookingByOrder(hostelId: string): Promise<IOrderResponse[] | string> {
        try {
            console.log(hostelId)
            const orders = await Order.find({ hostel_id: hostelId }).lean<IOrderResponse[]>();
            return orders;
        } catch (error) {
            return error as string
        }
    }

    async verifyPayment(bookingId: string): Promise<string> {
        try {
            const order = await Order.findOne({ _id: bookingId }) as unknown as IOrder;
            if (!order) {
                return Messages.OrderNotFound;
            }
            order.status = Messages.Paid;
            await order.save();
            return Messages.PaymentVerifiedSuccess;
        } catch (error) {
            return error as string
        }
    }

    async paymentFailed(bookingId: string): Promise<string> {
        try {
            const orderUpdate = await Order.findOneAndUpdate({ _id: bookingId }, { $set: { status: 'failed' } });

            if (!orderUpdate) {
                return Messages.OrderNotFound;
            }
            return Messages.PaymentFailed;
        } catch (error) {
            return error as string
        }
    }

    async repaymentSuccess(id: string): Promise<string> {
        try {
            const response = await Order.findOneAndUpdate({ _id: id }, { $set: { status: 'paid' } })
            return Messages.PaymentSuccess;
        } catch (error) {
            return error as string;
        }
    }

    async getSales(): Promise<IOrderResponse[] | string | null> {
        try {
            const response = await Order.find().lean<IOrderResponse[]>();
            return response;
        } catch (error) {
            return error as string
        }
    }
}


export default orderRepository