import {IUser} from '../../model/userModel';

export class UserDto{
    public readonly _id:string;
    public readonly name:string;
    public readonly email:string;
    public readonly mobile?:string;
    public readonly wallet_id?:string;
    public readonly isBlock?:boolean;
    public readonly userType?:string;

    constructor (user:IUser){
        this._id = user._id.toString();
        this.name = user.name;
        this.email = user.email;
        this.mobile = user.mobile;
        this.wallet_id = user.wallet_id ? user.wallet_id.toString() : undefined;
        this.isBlock = user.isBlock;
        this.userType = user.userType
    }

    public static from(user:IUser):UserDto{
        return new UserDto(user);
    }

    public static fromList(users:IUser[]):UserDto[]{
        return users.map(user => new UserDto(user))
    }

}