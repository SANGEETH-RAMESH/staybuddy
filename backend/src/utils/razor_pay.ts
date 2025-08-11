import Razorpay from 'razorpay';
import dotenv from 'dotenv'
import { Request, Response } from 'express';
import Order from '../model/orderModel';
import Hostel from '../model/hostelModel';
import mongoose, { Types } from 'mongoose';
import { IUpdateHostelInput } from '../dtos/HostelData';
import { StatusCode } from '../status/statusCode';

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_KEY_ID as string,
    key_secret: process.env.RAZOR_PAY_KEY_SECRET
})


export const repayment = async (req: Request, res: Response) => {
    console.log(req.body,"Vakku")
    const { amount } = req.body;
    const razorpay = new Razorpay({
        key_id: process.env.RAZOR_PAY_KEY_ID as string,
        key_secret: process.env.RAZOR_PAY_KEY_SECRET
    })
    const options = {
        amount: amount * 100,
        currency: 'INR',
        payment_capture: 1
    }
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            totalPrice: amount
        })
    } catch (error) {
        console.log(error)
        res.status(StatusCode.BAD_REQUEST).send("Not able to create payment .Please try again!")
    }
}

export const makePayment = async (req: Request, res: Response) => {
    const { totalAmount } = req.body
    const razorpay = new Razorpay({
        key_id: process.env.RAZOR_PAY_KEY_ID as string,
        key_secret: process.env.RAZOR_PAY_KEY_SECRET
    })
    const options = {
        amount: totalAmount * 100,
        currency: 'INR',
        payment_capture: 1
    }
    try {
        const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            totalPrice: totalAmount
        })
    } catch (error) {
        console.log(error)
        res.status(StatusCode.BAD_REQUEST).send("Not able to create payment .Please try again!")
    }

}

export const makeOrder = async (req: Request, res: Response) => {
    console.log('hiii')
    const user = req.user as { _id: string } | undefined;

    if (!user) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
    }
    const {
        totalAmount,
        ...bookingDetails
    } = req.body
    const findHostel = await Hostel.findOne({ _id: bookingDetails.hostel_id }).populate<{ host_id: IUpdateHostelInput }>('host_id');
    if (!findHostel) {
        throw new Error('Hostel not found');
    }


    const options = {
        amount: totalAmount * 100,
        currency: 'INR',
        // receipt: '237t23rb32j',
        payment_capture: 1
    }
    const response = await razorpay.orders.create(options)
    const host = findHostel?.host_id;
    const hostelid = findHostel._id as Types.ObjectId;
    const hostId = new mongoose.Types.ObjectId(bookingDetails.host_id);
    const user_id = new mongoose.Types.ObjectId(user._id);
    const paymentMethod = bookingDetails.paymentMethod == 'wallet' ? 'wallet' : 'online';
    const newOrder = await Order.create({
        category: bookingDetails.category,
        userId: user_id,
        customerName: bookingDetails.customerName,
        customerEmail: bookingDetails.customerEmail,
        customerPhone: bookingDetails.customerPhone,
        foodRate: bookingDetails.foodRate,
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
        selectedBeds: bookingDetails.selectedBeds,
        selectedFacilities: bookingDetails.selectedFacilities,
        tenantPreferred: bookingDetails.tenantPreferred,
        totalDepositAmount: bookingDetails.totalDepositAmount,
        totalRentAmount: bookingDetails.totalRentAmount,
        paymentMethod: paymentMethod,
        active: true,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate,
        cancellationPolicy: bookingDetails.cancellationPolicy,
        status: 'created',
    })
    await newOrder.save()

    const foodRate = findHostel.foodRate ?? 0;
    let amount = (bookingDetails.totalDepositAmount ?? 0) + (bookingDetails.totalRentAmount ?? 0) + foodRate;

    try {

        res.json({
            order_id: response.id,
            booking_id: newOrder._id,
            currency: response.currency,
            amount,
            hostelname: findHostel.hostelname,
            beds: bookingDetails.selectedBeds,
            customername: bookingDetails.customerName,
            customeremail: bookingDetails.customerEmail,
            customerphone: bookingDetails.customerPhone
        })
    } catch (error) {
        console.log(error)
        res.status(StatusCode.BAD_REQUEST).send("Not able to create payment .Please try again!")
    }
}