import { Router } from "express";
import OrderRepository from "../respository/orderRepository";
import OrderService from "../service/orderService";
import OrderController from "../controller/orderController";
import { makeOrder } from "../utils/razor_pay";
import userAuthMiddleware from '../middleware/userAuth'
import hostAuthMiddleware from "../middleware/hostAuth";

const order_route= Router()

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);



order_route.post('/bookings',userAuthMiddleware,orderController.createBooking.bind(orderController))
order_route.get('/bookings/:bookingId',userAuthMiddleware,orderController.getBookingDetails.bind(orderController))
order_route.post('/bookings/:bookingId/end',userAuthMiddleware,orderController.endBooking.bind(orderController))
order_route.get('/users/:userId/bookings',userAuthMiddleware,orderController.getSavedBookings.bind(orderController))
order_route.get('/users/:hostelId/allbookings',userAuthMiddleware,orderController.getBookingByOrder.bind(orderController))


order_route.get('/hosts/:hostId/bookings',hostAuthMiddleware,orderController.getBookings.bind(orderController))


order_route.post('/payment',makeOrder)

order_route.post('/reviews',userAuthMiddleware,orderController.submitReview.bind(orderController))
order_route.get('/reviews/:reviewId',userAuthMiddleware,orderController.getReviewDetails.bind(orderController))
order_route.get('/bookings/:bookingId/review',userAuthMiddleware,orderController.getReviewDetailsByOrderid.bind(orderController))



export default order_route