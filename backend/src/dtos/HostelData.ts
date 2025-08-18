import { Types } from "mongoose";
import { IHostResponse } from "./HostResponse";
import { IFacilities } from "./FacilitiyResponse";

export interface IPhoto {
  version: string;
  fileName: string;
}

export interface IUpdateHostelInput {
  _id?:string;
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
  facilities: IFacilities; 
  longitude:number;
  latitude:number;
  photos?: string[]; 
  hostelId?:string;
  phone?:string | string[];
  cancellationPolicy:string;
  totalRooms:number;
  isFull?:boolean;
  bookingType?:string;
  bedShareRoom?:number
}