import { Request, Response } from "express";
import { IOrderService } from "../interface/order/!OrderService";
import { ObjectId } from 'mongodb'
import { StatusCode } from "../status/statusCode";



class OrderController {
    constructor(private orderService: IOrderService) { }


    async createBooking(req: Request, res: Response) {
        try {
            const data = {
                ...req.body, userId: req.user?._id
            }
            const response = await this.orderService.userBookings(data);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getBookingDetails(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.bookingId;
            const orderId = new ObjectId(id);
            const response = await this.orderService.getOrderDetails(orderId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async endBooking(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.bookingId;
            if (!req.user) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: "No user" })
            }
            const userId = new ObjectId(req?.user?._id);
            const orderId = new ObjectId(id)
            const data = { userId, orderId }
            const response = await this.orderService.endBooking(data);
            res.status(StatusCode.OK).json({ success: true, message: response })

        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async submitReview(req: Request, res: Response): Promise<void> {
        try {
            const data = { ...req.body, userId: req.user?._id }
            const response = await this.orderService.createReview(data)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getReviewDetails(req: Request, res: Response): Promise<void> {
        try {
            const orderId = new ObjectId(req.params.reviewId)
            const response = await this.orderService.getReviewDetails(orderId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getReviewDetailsByOrderid(req: Request, res: Response): Promise<void> {
        try {
            const orderId = new ObjectId(req.params.bookingId)
            const response = await this.orderService.getReviewDetailsByOrderId(orderId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getSavedBookings(req: Request, res: Response): Promise<void> {
        try {
            const { skip, limit } = req.query
            const pageStr = typeof skip === 'string' ? skip : '0';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const id = req.params.userId;
            const userId = new ObjectId(id)
            const response = await this.orderService.getSavedBookings(userId, pageStr, limitStr);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getBookingByOrder(req:Request,res:Response):Promise<void>{
        try {
            const hostelId = req.params.hostelId;
            const response = await this.orderService.getBookingByOrder(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const hostId = req.params.hostId;
            const { skip, limit } = req.query
            const pageStr = typeof skip === 'string' ? skip : '0';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const response = await this.orderService.getBookings(hostId, pageStr, limitStr)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }
}

export default OrderController