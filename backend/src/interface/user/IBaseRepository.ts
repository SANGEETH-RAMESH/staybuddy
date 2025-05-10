import { Types } from "mongoose";

export interface IBaseRepository<T> {
    findByEmail(email: string): Promise<T | null>;
    findById(id: Types.ObjectId): Promise<T | null>;
    findAll(): Promise<T[]>;
    deleteById(id: Types.ObjectId): Promise<string>;
    deleteAll(): Promise<boolean>;
}
