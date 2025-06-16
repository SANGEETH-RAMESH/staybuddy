import { Host } from "./Host";
import { Review } from "./Review";
// import { Hostel } from "./Hostel";

export interface Order {
  _id: string;
  hostelname: string;
  location: string;
  nearbyaccess: string;
  beds: number;
  policies: string;
  category: string;
  advanceamount: number;
  photos: string[];
  facilities: string[];
  bedShareRoom: number;
  foodRate: number;
  phone: string;
  host_id: Host;
  reviews: Review[];
  createdAt: string;
  totalRentAmount: string;
  hostel_id: {
    id: string;
    hostName: string;
    hostelName: string;
    location: string;
    image: string;
    averageRating: number;
    reviews: Review[];
    hostelname: string
    facilities: string | string[]
    beds: string;
    bedShareRoom: string;
    foodRate?: string;
    photos: string;
    nearbyaccess: string;
    policies: string;
    host_id: Host;
    phone: string;
    advanceamount: string;
  }
};
