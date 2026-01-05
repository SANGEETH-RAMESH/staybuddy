import { Request, Response } from "express";
import { IOrderService } from "../interface/order/!OrderService";
import { ObjectId } from 'mongodb'
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";



class OrderController {
    constructor(private _orderService: IOrderService) { }


    async createBooking(req: Request, res: Response) {
        try {
            const data = {
                ...req.body, userId: req.user?._id
            }
            const response = await this._orderService.userBookings(data);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getBookingDetails(req: Request, res: Response): Promise<void> {
        try {
            const id = req.params.bookingId;
            const orderId = new ObjectId(id);
            const response = await this._orderService.getOrderDetails(orderId)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async endBooking(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body, 'body')
            const id = req.params.bookingId;
            if (!req.user) {
                res.status(StatusCode.NOT_FOUND).json({ success: false, message: Messages.NoUser })
            }
            const { cancellationStatus } = req.body
            const userId = new ObjectId(req?.user?._id);
            const orderId = new ObjectId(id)
            const data = { userId, orderId, cancellationStatus }
            const response = await this._orderService.endBooking(data);
            res.status(StatusCode.OK).json({ success: true, message: response })

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async submitReview(req: Request, res: Response): Promise<void> {
        try {
            const data = { ...req.body, userId: req.user?._id }
            const response = await this._orderService.createReview(data)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getReviewDetails(req: Request, res: Response): Promise<void> {
        try {
            const orderId = new ObjectId(req.params.reviewId)
            const response = await this._orderService.getReviewDetails(orderId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getReviewDetailsByOrderid(req: Request, res: Response): Promise<void> {
        try {
            const orderId = new ObjectId(req.params.bookingId)
            const response = await this._orderService.getReviewDetailsByOrderId(orderId);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getSavedBookings(req: Request, res: Response): Promise<void> {
        try {
            const { skip, limit } = req.query
            const pageStr = typeof skip === 'string' ? skip : '0';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const id = req.params.userId;
            const userId = new ObjectId(id)
            const response = await this._orderService.getSavedBookings(userId, pageStr, limitStr);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getBookingByOrder(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.hostelId;
            const response = await this._orderService.getBookingByOrder(hostelId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getBookings(req: Request, res: Response): Promise<void> {
        try {
            const hostId = req.params.hostId;
            const { skip, limit } = req.query
            const pageStr = typeof skip === 'string' ? skip : '0';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const response = await this._orderService.getBookings(hostId, pageStr, limitStr)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async verifyPayment(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body;
            const response = await this._orderService.verifyPayment(bookingId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async paymentFailed(req: Request, res: Response): Promise<void> {
        try {
            const { bookingId } = req.body;
            const response = await this._orderService.paymentFailed(bookingId);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async repaymentSuccess(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.body;
            const response = await this._orderService.repaymentSuccess(id);
            res.status(StatusCode.OK).json({ message: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }
}

export default OrderController