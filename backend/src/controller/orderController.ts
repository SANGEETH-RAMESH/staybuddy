import { Request, Response } from "express";
import { IOrderService } from "../interface/order/!OrderService";
import { ObjectId } from 'mongodb'
import { StatusCode } from "../status/statusCode";



class OrderController {
    constructor(private orderService: IOrderService) { }


    async orders(req: Request, res: Response) {
        try {
            console.log('heeeeee')
            const data = {
                ...req.body, userId: req.user?._id
            }
            const response = await this.orderService.userBookings(data);
            console.log(response, 'hee')
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getOrderDetails(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            const orderId = new ObjectId(id);
            const response = await this.orderService.getOrderDetails(orderId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async endBooking(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.id;
            console.log(req.user, id)
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
            const orderId = new ObjectId(req.params.id)
            const response = await this.orderService.getReviewDetails(orderId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getReviewDetailsByOrderid(req: Request, res: Response): Promise<void> {
        try {
            const orderId = new ObjectId(req.params.id)
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
            const id = req.params.id;
            const userId = new ObjectId(id)
            const response = await this.orderService.getSavedBookings(userId, pageStr, limitStr);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: error })
        }
    }

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const hostId = req.params.id;
            console.log(req.query)
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