import mongoose,{Document,Schema} from "mongoose";

export interface IOtp extends Document{
    email:string,
    otp:number,
    createdAt:Date
}

const otpModel : Schema = new Schema(
    {
        email:{
            type:String,
            required:true
        },
        otp:{
            type:Number,
            required:true
        },
        createdAt:{
            type:Date,
            default:Date.now,
            expires:60
        }
    },
    {timestamps:false}
)

const Otp = mongoose.model<IOtp>("Otp",otpModel);

export default Otp