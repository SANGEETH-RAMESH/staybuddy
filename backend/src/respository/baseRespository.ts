import { Model, Types } from "mongoose";
import { IBaseRepository } from "../interface/user/IBaseRepository";

class baseRepository<T> implements IBaseRepository<T> {
    private model: Model<T>;

   
    constructor(model: Model<T>) {
        this.model = model;
    }

    
    async findByEmail(filter: object): Promise<T | null> {
        try {
            const data = await this.model.findOne(filter).exec();
            // const d = await this.model.find();
            // console.log(d)
            // console.log(data,email,"data")
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    
    async findById(id: Types.ObjectId): Promise<T | null> {
        try {
            // console.log("hey")
            const data = await this.model.findById(id).exec();
            return data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    
    async findAll(): Promise<T[]> {
        try {
            const data = await this.model.find().exec();
            return data;
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
