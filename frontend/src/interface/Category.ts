import { ObjectId } from 'bson';

export interface Category {
  _id: ObjectId | string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}