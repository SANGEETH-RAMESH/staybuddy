import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";



export interface IHostelRepository {
    getHostels(page: string, limit: string, search?: string): Promise<{ hostels: IHostel[]; totalCount: number } | string>,
    getSingleHostel(id: Types.ObjectId): Promise<IHostel | string>,
    addHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getHostHostels(id: Types.ObjectId, limit: number, skip: number): Promise<{hostels: IHostel[]; totalCount: number } | string>,
    deleteHostel(hostelId: string): Promise<string>,
    updateHostel(hostelData:IUpdateHostelInput): Promise<string>,
    getOneHostel(id:Types.ObjectId):Promise<IHostel | string>,

}