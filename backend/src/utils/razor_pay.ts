import Razorpay from 'razorpay';
import dotenv from 'dotenv'
import { Request, Response } from 'express';

dotenv.config();


export const makeOrder = async (req: Request, res: Response) => {
    // console.log(req.body,'hello')
    // console.log(process.env.RAZOR_PAY_KEY_ID, process.env.RAZOR_PAY_KEY_SECRET);
    const { totalAmount } = req.body
    const razorpay = new Razorpay({
        key_id: process.env.RAZOR_PAY_KEY_ID as string,
        key_secret: process.env.RAZOR_PAY_KEY_SECRET
    })
    // console.log('heyeee')
    const options = {
        amount: totalAmount,
        currency: 'INR',
        receipt: '237t23rb32j',
        payment_capture: 1
    }
    try {
        const response = await razorpay.orders.create(options)
        // console.log("2")
        // console.log(response, 'responsesse')
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        console.log(error)
        res.status(400).send("Not able to create payment .Please try again!")
    }

}