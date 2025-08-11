import { Model, Types } from "mongoose";
import { IBaseRepository } from "../interface/user/IBaseRepository";

class baseRepository<T> implements IBaseRepository<T> {
    private model: Model<T>;


    constructor(model: Model<T>) {
        this.model = model;
    }


    async findByEmail(filter: object, projection?: any): Promise<T | null> {
        try {
            return await this.model.findOne(filter, projection).lean<T>().exec();
        } catch (error) {
            console.error(error);
            return null;
        }
    }


    async findById(id: Types.ObjectId,projection?:any): Promise<T | null> {
        try {
            const data = await this.model.findById(id,projection).exec();
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }


    async findAll(): Promise<T[]> {
        try {
            return await this.model.find().exec();
        } catch (error) {
            console.error(error);
            return [];
        }
    }


    async deleteById(id: Types.ObjectId): Promise<string> {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            if (result) {
                return `${this.model.modelName} deleted`;
            }
            return `${this.model.modelName} not deleted`;
        } catch (error) {
            console.error(error);
            return error as string;
        }
    }


    async deleteAll(): Promise<boolean> {
        try {
            const result = await this.model.deleteMany({}).exec();
            return result.deletedCount > 0;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export default baseRepository;
