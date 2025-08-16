import { Review } from "./Review";
import { Host } from "./Host";
import { Facilities } from "./Facilities";



export interface Hostel {
  _id: string;
  hostName: string;
  // hostelName: string;
  location: string;
  // photos:sst
  image: string | string[];
  averageRating: number;
  reviews: Review[];
  hostelname: string
  facilities?:  Facilities | string | string[];
  beds:  number;
  bedShareRoom: string;
  foodRate?: string;
  hostel_id: string;
  photos: string;
  nearbyaccess: string;
  policies: string;
  host_id: Host;
  phone: string;
  advanceamount: string;
  isActive: boolean;
  inactiveReason: string;
  address: string;
  rating?: number;
  contact?: number;
  totalRooms?: number;
  latitude?: number;
  longitude?: number;
  category: string;
  cancellationPolicy?:string;
  isFull?:boolean;
  bookingType:string
};

