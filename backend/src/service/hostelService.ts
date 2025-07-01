import { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import { IHostelService } from "../interface/hostel/!HostelService";
import { IHostel } from "../model/hostelModel";
import { IUpdateHostelInput } from "../dtos/HostelData";




class hostelService implements IHostelService {
    constructor(private hostelRepository: IHostelRepository) { }


    async getHostels(page: string, limit: string, search?: string): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const response = await this.hostelRepository.getHostels(page, limit, search);
            return response;
        } catch (error) {
            return error as string
        }
    }

    async getSingleHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            const response = await this.hostelRepository.getSingleHostel(id);
            return response
        } catch (error) {
            return error as string
        }
    }

    async addHostel(hostData: IUpdateHostelInput): Promise<string> {
        try {
            const response = await this.hostelRepository.addHostel(hostData)
            console.log(response, 'service')
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const response = await this.hostelRepository.getHostHostels(id, limit, skip);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            const response = await this.hostelRepository.deleteHostel(hostelId);
            return response;
        } catch (error) {
            return error as string;
        }
    }

     async updateHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            const response = await this.hostelRepository.updateHostel(hostelData);
            return response;
        } catch (error) {
            return error as string;
        }
    }

     async getOneHostel(id: Types.ObjectId): Promise<IHostel | string> {
            try {
                const response = await this.hostelRepository.getOneHostel(id)
                return response;
            } catch (error) {
                console.log(error)
                return error as string
            }
        }
}

export default hostelService