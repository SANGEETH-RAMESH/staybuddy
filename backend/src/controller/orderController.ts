import { Request, Response } from "express";
import { IOrderService } from "../interface/order/!OrderService";
import {ObjectId} from 'mongodb'



class OrderController{
    constructor(private orderService: IOrderService) { }


    async orders(req:Request,res:Response){
        try {
            console.log('heeeeee')
            // console.log("eh",req.body)
            // const data = 
            // console.log(req.user,'hello')
            const data = {
                ...req.body,userId:req.user?._id
            }
            // console.log(data,'dataa')
            const response = await this.orderService.userBookings(data);
            console.log(response,'hee')
            res.status(200).json({success:true,message:response})
        } catch (error) {
            console.log(error)
        }
    }

    async getOrderDetails(req:Request,res:Response):Promise<void>{
        try {
            const id = req.params.id;
            const orderId = new ObjectId(id);
            const response = await this.orderService.getOrderDetails(orderId)
            res.status(200).json({success:true,message:response})
        } catch (error) {
            res.status(401).json({message:error})
        }
    }

    async endBooking(req:Request,res:Response):Promise<void>{
        try {
            const id = req.params.id;
            console.log(req.user,id)
            if(!req.user){
                res.status(400).json({success:false,message:"No user"})
            }
            const userId = new ObjectId(req?.user?._id);
            const orderId = new ObjectId(id)
            const data = {userId,orderId}
            const response = await this.orderService.endBooking(data);
            res.status(200).json({success:true,message:response})

        } catch (error) {
            console.log(error)
            res.status(401).json({message:"Error occured"})
        }
    }

    async submitReview(req:Request,res:Response):Promise<void>{
        try {
            // console.log(req.body,"body")
            // console.log(req.user,"user")
            const data = {...req.body,userId:req.user?._id}
            const response = await this.orderService.createReview(data)
            res.status(200).json({success:true,message:response})
        } catch (error) {
            console.log(error)        
            res.status(400).json({success:false,message:"Error occured"})
        }
    }

    async getReviewDetails(req:Request,res:Response):Promise<void>{
        try {
            // console.log("esfd")
            // console.log(req.params.id);
            const orderId = new ObjectId(req.params.id)
            const response = await this.orderService.getReviewDetails(orderId);
            res.status(200).json({success:true,message:response})
        } catch (error) {
            console.log(error)
        }
    }

    async getReviewDetailsByOrderid(req:Request,res:Response):Promise<void>{
        try {
            // console.log("esfd")
            // console.log(req.params.id);
            const orderId = new ObjectId(req.params.id)
            const response = await this.orderService.getReviewDetailsByOrderId(orderId);
            res.status(200).json({success:true,message:response})
        } catch (error) {
            console.log(error)
        }
    }
}

export default OrderController