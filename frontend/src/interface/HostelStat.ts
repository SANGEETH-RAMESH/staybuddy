import { ObjectId } from "mongoose";

export interface HostelStat {
  hostel_id: string | ObjectId;
  name: string;
  location: string;
  host_mobile: string;
  photos: string[];
  totalBookings: number;
  totalRevenue: number;
  policies: string;
  nearbyaccess: string;
}

