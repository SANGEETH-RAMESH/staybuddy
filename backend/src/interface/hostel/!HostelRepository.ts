import mongoose, { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";



export interface IHostelRepository {
    getHostels(query: Record<string, any>,projection:IUpdateHostelInput, sortOption: any): Promise<(IHostel & { isFull: boolean })[]>,
    getSingleHostel(id: Types.ObjectId): Promise<(IHostel & { isFull: boolean })| string>,
    addHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string>,
    deleteHostel(hostelId: string): Promise<string>,
    updateHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getOneHostel(id: Types.ObjectId): Promise<IHostel | string>,
    findAverageRatedHostelIds(minRating: number): Promise<{ hostelId: mongoose.Types.ObjectId; rating: number }[]>,
    updateStatus(id:string,isActive:boolean,inactiveReason:string): Promise<string>,
    getAllHostel():Promise<IHostel[] | string>
}