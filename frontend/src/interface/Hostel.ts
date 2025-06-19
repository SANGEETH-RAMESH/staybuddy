import { Review } from "./Review";
import { Host } from "./Host";



export interface Hostel  {
  _id: string;
  hostName: string;
  // hostelName: string;
  location: string;
  // photos:sst
  image: string;
  averageRating: number;
  reviews: Review[];
  hostelname:string
  facilities:string|string[]
  beds:string;
  bedShareRoom:string;
  foodRate?:string;
  photos:string;
  nearbyaccess:string;
  policies:string;
  host_id:Host;
  phone:string;
  advanceamount:string;
};

