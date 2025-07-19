import { Types } from "mongoose";
import { IHostel } from "../../model/hostelModel";
import { IUpdateHostelInput } from "../../dtos/HostelData";



export interface IHostelService {
  getHostels(page: string, limit: string, search?: string, lat?: number, lng?: number, radius?: number, filters?: {
    rating?: number;
    facilities?: string[];
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<{ hostels: IHostel[]; totalCount: number } | string>,
  getSingleHostel(id: Types.ObjectId): Promise<IHostel | string>,
  addHostel(hostData: IUpdateHostelInput): Promise<string>,
  getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string>,
  deleteHostel(hostelId: string): Promise<string>,
  updateHostel(hostelData: IUpdateHostelInput): Promise<string>,
  getOneHostel(id: Types.ObjectId): Promise<IHostel | string>,
  updateStatus(id: string, isActive: boolean, inactiveReason: string): Promise<string>,
  getAllHostel():Promise<IHostel[] | string>

}