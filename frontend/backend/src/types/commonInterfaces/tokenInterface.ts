import { Types } from "mongoose";

export interface userPayload {
  _id: Types.ObjectId;
  role: 'user';
}

export interface hostPayload {
  _id:  Types.ObjectId;
  role: 'host';
}

export interface adminPayload {
  _id:  Types.ObjectId;
  role: 'admin';
}