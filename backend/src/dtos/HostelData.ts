export interface IUpdateHostelInput {
  name: string;
  location: string;
  mobile: string;
  bedsPerRoom: number;
  policies: string;
  category: string;
  nearbyAccess: string;
  advance: string;
  bedShareRate: string;
  foodRate: string;
  host_id: string;
  facilities: string; 
  longitude:number;
  latitude:number;
  photo?: string; 
  hostelId:string;
  phoneNumber?:string;
  cancellationPolicy:string;
  totalRooms:number;
}