import mongoose, { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import Hostel, { IHostel } from "../model/hostelModel";
import baseRepository from "./baseRespository";
import { IUpdateHostelInput } from "../dtos/HostelData";



class hostelRepository extends baseRepository<IHostel> implements IHostelRepository {
    constructor() {
        super(Hostel)
    }

    async getHostels(page: string, limit: string, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }
            let filter = {};
            if (search && search.trim() !== '') {
                const searchRegex = new RegExp('^' + search, 'i');
                filter = {
                    $or: [
                        { hostelname: { $regex: searchRegex } },
                    ]
                };
            }
            const totalCount = await Hostel.countDocuments(filter);
            const hostels = await Hostel.find(filter)
                .sort({ createdAt: -1 })
                .skip((pageNumber - 1) * limitNumber)
                .limit(limitNumber);
            return { hostels, totalCount };
        } catch (error) {
            return error as string;
        }
    }

    async getSingleHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            const getHostel = await Hostel.findOne({ _id: id }).populate('host_id')
            if (!getHostel) {
                return "No Hostel"
            }
            return getHostel
        } catch (error) {
            return error as string
        }
    }

    async addHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            console.log(hostelData, 'sss');
            const host_id = new mongoose.Types.ObjectId(hostelData.host_id);
            const addingHostelData = Object.assign(
                {
                    hostelname: hostelData.name,
                    location: hostelData.location,
                    nearbyaccess: hostelData.nearbyAccess,
                    beds: hostelData.bedsPerRoom,
                    policies: hostelData.policies,
                    category: hostelData.category,
                    advanceamount: hostelData.advance,
                    facilities: hostelData.facilities,
                    bedShareRoom: hostelData.bedShareRate,
                    foodRate: hostelData.foodRate,
                    phone: hostelData.phoneNumber,
                    host_id: host_id
                },
                hostelData.photo ? { photos: hostelData.photo } : {}
            );

            const addingHostel = new Hostel(addingHostelData)
            console.log(addingHostel, 'heelo')
            if (addingHostel) {
                await addingHostel.save();
                return 'Hostel added'
            } else {
                return 'Hostel not added'
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const getHostel = await Hostel.find({ host_id: id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
            const totalCount = await Hostel.countDocuments({ host_id: id });
            return {
                hostels: getHostel,
                totalCount
            };

        } catch (error) {
            return error as string
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            console.log(hostelId)
            await Hostel.findOneAndDelete({ _id: hostelId });
            return "Hostel Deleted"
        } catch (error) {
            return error as string;
        }
    }

    async updateHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            console.log(hostelData, 'hostelll')
            const updateFields: any = {
                hostelname: hostelData.name,
                location: hostelData.location,
                nearbyaccess: hostelData.nearbyAccess,
                beds: hostelData.bedsPerRoom,
                policies: hostelData.policies,
                category: hostelData.category,
                advanceamount: hostelData.advance,
                facilities: hostelData.facilities,
                photos: hostelData.photo,
            };

            const facilitiesArray = Array.isArray(hostelData.facilities)
                ? hostelData.facilities
                : hostelData.facilities.split(',');

            if (facilitiesArray.includes('food')) {
                updateFields.foodRate = hostelData.foodRate;
            }

            await Hostel.updateOne(
                { _id: hostelData.hostelId },
                { $set: updateFields }
            );

            return 'Hostel updated successfully';
        } catch (error) {
            return error as string;
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            const hostelFind = await Hostel.findOne({ _id: id }).populate('host_id')
            if (hostelFind) {
                return hostelFind
            } else {
                return "Hostel not found"
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }
}

export default hostelRepository