import mongoose, { Types } from "mongoose";
import { IUpdateHostelInput } from "../../dtos/HostelData";
import { FilterQuery, SortOrder } from "mongoose";
import { IHostel } from "../../model/hostelModel";


export interface IHostelRepository {
    getHostels(query: FilterQuery<IUpdateHostelInput>, projection?: Partial<IUpdateHostelInput>, sortOption?: Record<string, SortOrder> ): Promise<IUpdateHostelInput[]>,
    getSingleHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | null | string>,
    addHostel(hostelData: Partial<IHostel>): Promise<string>,
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