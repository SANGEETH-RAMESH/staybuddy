import { Types } from "mongoose";


export interface Order {
  _id: string;
  category: string;
  userId: Types.ObjectId;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  hostName: string;
  foodRate: number | null;
  host_id: Types.ObjectId;
  hostel_id: Types.ObjectId;
  name: string,
  location: string,
  host_mobile: string,
  nearbyaccess: string,
  policies: string,
  advanceamount: number,
  bedShareRoom: number,
  photos: string[],
  selectedBeds: number;
  selectedFacilities: {
    wifi: boolean;
    laundry: boolean;
    food: boolean;
    [key: string]: boolean;
  };
  tenantPreferred: string;
  totalDepositAmount: number;
  totalRentAmount: number;
  paymentMethod: "online" | "wallet";
  active: boolean
  createdAt?: Date;
  fromDate?: Date;
  toDate?: Date;
  guests?: string;
  cancellationPolicy?: string;
  cancelled?:boolean
};
