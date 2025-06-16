import { Types } from "mongoose";

export interface IHostResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  isBlock: boolean;
  wallet_id: string | null;
}
