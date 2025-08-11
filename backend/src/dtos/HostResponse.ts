import { Types } from "mongoose";

export interface IHostResponse {
    _id: string | Types.ObjectId;
    name: string;
    email: string;
    mobile: number;
    isBlock: boolean;
    approvalRequest: string;
    photo?: string | null;
    documentType?: string | null;
    wallet_id?: Types.ObjectId | null;
    password:string;
    temp?:boolean;
}