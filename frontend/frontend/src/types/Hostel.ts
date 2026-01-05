import { Review } from "./Review";


export type Hostel = {
  id: string;
  hostName: string;
  hostelName: string;
  location: string;
  image: string;
  averageRating: number;
  reviews: Review[];
};