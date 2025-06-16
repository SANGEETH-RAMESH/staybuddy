import { ObjectId } from "mongodb";


export interface User {
  _id: ObjectId | string;
  name: string;
  email: string;
  location: string | null;
  isBlock: boolean;
  isAdmin:boolean
}