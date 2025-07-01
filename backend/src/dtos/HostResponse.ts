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
}