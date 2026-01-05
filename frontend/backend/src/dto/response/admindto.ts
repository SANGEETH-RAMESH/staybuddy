import { Types } from "mongoose";
import { IUser } from "../../model/userModel";




export class AdminDto{
    public readonly _id:string;
    public readonly name:string;
    public readonly email:string;
    public readonly mobile?:string;


    constructor(admin:IUser){
        this._id = admin._id.toString();
        this.name = admin.name;
        this.email = admin.email;
        this.mobile = admin.mobile;
    }

    public static from(admin:IUser):AdminDto{
        return new AdminDto(admin)
    }
}