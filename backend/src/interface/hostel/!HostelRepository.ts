import mongoose, { Types } from "mongoose";
import { IUpdateHostelInput } from "../../dtos/HostelData";



export interface IHostelRepository {
    getHostels(query: Record<string, any>,projection:IUpdateHostelInput, sortOption: any): Promise<IUpdateHostelInput[]>,
    getSingleHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | null | string>,
    addHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string,sort?:string): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string>,
    deleteHostel(hostelId: string): Promise<string>,
    updateHostel(id: string, updateFields: Partial<IUpdateHostelInput>): Promise<string>,
    getOneHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | string>,
    findAverageRatedHostelIds(minRating: number): Promise<{ hostelId: mongoose.Types.ObjectId; rating: number }[]>,
    updateStatus(id:string,isActive:boolean,inactiveReason:string): Promise<string>,
    getAllHostel():Promise<IUpdateHostelInput[] | string>,
    searchHostel(name: string): Promise<IUpdateHostelInput[] | string | null>,
    getAllHostels(page: string, limit: string): Promise<{ hostels: IUpdateHostelInput[], totalCount: number; } | string | null>,
}