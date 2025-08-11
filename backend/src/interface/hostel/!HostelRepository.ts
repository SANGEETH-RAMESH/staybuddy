import mongoose, { Types } from "mongoose";
import { IUpdateHostelInput } from "../../dtos/HostelData";



export interface IHostelRepository {
    getHostels(query: Record<string, any>,projection:IUpdateHostelInput, sortOption: any): Promise<(IUpdateHostelInput & { isFull: boolean })[]>,
    getSingleHostel(id: Types.ObjectId): Promise<(IUpdateHostelInput & { isFull: boolean })| string>,
    addHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string>,
    deleteHostel(hostelId: string): Promise<string>,
    updateHostel(hostelData: IUpdateHostelInput): Promise<string>,
    getOneHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | string>,
    findAverageRatedHostelIds(minRating: number): Promise<{ hostelId: mongoose.Types.ObjectId; rating: number }[]>,
    updateStatus(id:string,isActive:boolean,inactiveReason:string): Promise<string>,
    getAllHostel():Promise<IUpdateHostelInput[] | string>,
    searchHostel(name: string): Promise<IUpdateHostelInput[] | string | null>,
    getAllHostels(page: string, limit: string): Promise<{ hostels: IUpdateHostelInput[], totalCount: number; } | string | null>,
}