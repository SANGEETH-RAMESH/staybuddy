import { ObjectId } from "mongoose";

export interface UserStat {
  userId: string | ObjectId;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalBookings: number;
  totalSpent: number;
}