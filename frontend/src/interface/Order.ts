import { Host } from "./Host";
import { Review } from "./Review";

export interface HostelData  {
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
};
