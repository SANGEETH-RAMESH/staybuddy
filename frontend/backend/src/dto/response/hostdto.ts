import { IHost } from "../../model/hostModel";

export class HostDto{
    public readonly _id:string;
    public readonly name:string;
    public readonly email:string;
    public readonly mobile?:number;
    public readonly isBlock?:boolean;
    public readonly approvalRequest: string;
    public readonly photo?: string | null;
    public readonly documentType?: string | null;
    public readonly wallet_id?: string;
    public readonly hostType?: string;

    constructor(host:IHost){
        this._id = host._id!.toString();
        this.name = host.name;
        this.email = host.email;
        this.mobile = host.mobile;
        this.approvalRequest = host.approvalRequest;
        this.photo = host.photo;
        this.documentType = host.documentType;
        this.wallet_id = host.wallet_id? host.wallet_id.toString() : undefined;
        this.hostType = host.hostType;
    }

    public static from(host:IHost):HostDto{
        return new HostDto(host);
    }

    public static fromList(hosts:IHost[]):HostDto[]{
        return hosts.map(host => new HostDto(host));
    }
}