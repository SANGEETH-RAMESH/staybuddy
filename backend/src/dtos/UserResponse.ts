import { Types } from "mongoose";

export interface IUserResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  isBlock: boolean;
  wallet_id?: Types.ObjectId | null;
  temp?:boolean;
}
