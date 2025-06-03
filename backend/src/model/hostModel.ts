import mongoose,{Document,Schema, Types} from "mongoose";

export interface IHost extends Document{
    name:string,
    email:string,
    password:string,
    mobile:number,
    isBlock:boolean,
    temp:boolean,
    tempExpires?:Date,
    approvalRequest:string;
    photo?: string | null;
    documentType?: string | null;
    wallet_id:Types.ObjectId
}

const hostModel:Schema = new Schema(
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
            required: true,
        },
        mobile: {
            type: String,
            required: true,
        },
        isBlock:{
            type:Boolean,
            default:false
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
        approvalRequest:{
            type:String,
            default:1
        },
        photo: {
            type: String,
            default: null
        },
        documentType: {
            type: String,
            default: null
        },
        wallet_id:{
            type:Types.ObjectId,
            default:null
        }
    },
    { timestamps: false }
)

const Host = mongoose.model<IHost>("Host",hostModel);

export default Host