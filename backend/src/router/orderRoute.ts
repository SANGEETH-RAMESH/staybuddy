import { Router } from "express";
import OrderRepository from "../respository/orderRepository";
import OrderService from "../service/orderService";
import OrderController from "../controller/orderController";
import { makeOrder } from "../utils/razor_pay";
import userAuthMiddleware from '../middleware/userAuth'

const order_route= Router()

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const orderController = new OrderController(orderService);


order_route.post('/bookings',userAuthMiddleware,orderController.orders.bind(orderController))
order_route.post('/payment',makeOrder)
order_route.get('/getOrderDetails/:id',userAuthMiddleware,orderController.getOrderDetails.bind(orderController))
order_route.post('/endBooking/:id',userAuthMiddleware,orderController.endBooking.bind(orderController))
order_route.post('/submitReview',userAuthMiddleware,orderController.submitReview.bind(orderController))
order_route.get('/getReviewDetails/:id',userAuthMiddleware,orderController.getReviewDetails.bind(orderController))
order_route.get('/getReviewDetailsByOrderId/:id',userAuthMiddleware,orderController.getReviewDetailsByOrderid.bind(orderController))



export default order_route