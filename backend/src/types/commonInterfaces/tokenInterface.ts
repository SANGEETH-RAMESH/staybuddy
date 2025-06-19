import { Types} from 'mongoose';

export interface userPayload {
    _id: Types.ObjectId;
    name: string;
    email: string;
    mobile: string;
    iat?: number;
    exp?: number;
  }

export interface adminPayload {
    _id: Types.ObjectId;
    name: string;
    email: string;
    mobile: string;
    iat?: number;
    exp?: number;
}

export interface hostPayload {
    _id:Types.ObjectId;
    name:string;
    email:string;
    mobile:string;
}