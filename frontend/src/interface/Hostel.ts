import { Review } from "./Review";




export interface Hostel  {
  id: string;
  hostName: string;
  hostelName: string;
  location: string;
  image: string;
  averageRating: number;
  reviews: Review[];
};

