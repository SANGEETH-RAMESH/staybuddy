import mongoose, { Document, Schema,Types } from "mongoose";


export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    mobile: string;
    isAdmin:boolean;
    isBlock:boolean,
    wallet_id:Types.ObjectId,
    temp: boolean,
    tempExpires?: Date;
    userType?:string
}


const userModel: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        mobile: {
            type: String,
        },
        isAdmin: {
            type: Boolean,
            default:false
        },
        isBlock:{
            type:Boolean,
            default:false
        },
        wallet_id:{
            type:Types.ObjectId,
            default:null
        },
        temp: {
            type: Boolean,
            default: false
        },
        tempExpires: {
            type:Date,
            default:Date.now,
            expires:60
        },
        userType:{
            type:String
        }
    },
    { timestamps: false }
);

const User = mongoose.model<IUser>("User", userModel);

export default User;
