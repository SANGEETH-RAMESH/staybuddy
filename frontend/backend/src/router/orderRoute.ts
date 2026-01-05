import { Router } from "express";
import OrderRepository from "../respository/orderRepository";
import WalletRepository from "../respository/walletRepository";
import OrderService from "../service/orderService";
import OrderController from "../controller/orderController";
import { makeOrder, repayment } from "../utils/razor_pay";
import userAuthMiddleware from '../middleware/userAuth'
import hostAuthMiddleware from "../middleware/hostAuth";

const order_route= Router()

const orderRepository = new OrderRepository();
const walletRepository = new WalletRepository();
const orderService = new OrderService(orderRepository,walletRepository);
const orderController = new OrderController(orderService);



order_route.post('/bookings',userAuthMiddleware,orderController.createBooking.bind(orderController))
order_route.get('/bookings/:bookingId',userAuthMiddleware,orderController.getBookingDetails.bind(orderController))
order_route.post('/bookings/:bookingId/end',userAuthMiddleware,orderController.endBooking.bind(orderController))
order_route.get('/users/:userId/bookings',userAuthMiddleware,orderController.getSavedBookings.bind(orderController))
order_route.get('/users/:hostelId/allbookings',userAuthMiddleware,orderController.getBookingByOrder.bind(orderController))


order_route.get('/hosts/:hostId/bookings',hostAuthMiddleware,orderController.getBookings.bind(orderController))


order_route.post('/payment',userAuthMiddleware,makeOrder)
order_route.post('/payment/repay',userAuthMiddleware,repayment)
order_route.post('/payment/repaymentSuccess',userAuthMiddleware,orderController.repaymentSuccess.bind(orderController))
order_route.post('/payment/verify',userAuthMiddleware,orderController.verifyPayment.bind(orderController))
order_route.post('/payment/failed',userAuthMiddleware,orderController.paymentFailed.bind(orderController))

order_route.post('/reviews',userAuthMiddleware,orderController.submitReview.bind(orderController))
order_route.get('/reviews/:reviewId',userAuthMiddleware,orderController.getReviewDetails.bind(orderController))
order_route.get('/bookings/:bookingId/review',userAuthMiddleware,orderController.getReviewDetailsByOrderid.bind(orderController))



export default order_route