import { ObjectId } from 'mongodb';

export interface Host{
  _id: ObjectId;
  name: string;
  email: string;
  mobile: string;
  count:string
  isBlock: boolean;
  approvalRequest: string;
  tempExpires: string;
  photo:string;
  status:string;
  documentType:string;
  createdAt:string;
  address:string;
}