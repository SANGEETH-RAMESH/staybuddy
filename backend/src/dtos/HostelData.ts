import { Types } from "mongoose";
import { IHostResponse } from "./HostResponse";

export interface IUpdateHostelInput {
  _id:string;
  hostelname: string;
  location: string;
  mobile?: string;
  beds: number;
  policies: string;
  category: string;
  nearbyaccess: string;
  advanceamount: string | number;
  bedShareRate?: string;
  foodRate: string | number;
  host_id: string | Types.ObjectId |IHostResponse ;
  facilities: string | string[]; 
  longitude:number;
  latitude:number;
  photos?: string | string[]; 
  hostelId?:string;
  phoneNumber?:string;
  cancellationPolicy:string;
  totalRooms:number;
  isFull?:boolean;
}