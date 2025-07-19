import mongoose, { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import Hostel, { IHostel } from "../model/hostelModel";
import baseRepository from "./baseRespository";
import { IUpdateHostelInput } from "../dtos/HostelData";
import Review from "../model/reviewModel";

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}



class hostelRepository extends baseRepository<IHostel> implements IHostelRepository {
    constructor() {
        super(Hostel)
    }

    async getHostels(query: Record<string, any>, sortOption: any = {}): Promise<IHostel[]> {
        return await Hostel.find(query).sort(sortOption);
    }

    async findAverageRatedHostelIds(rating: number): Promise<{ hostelId: mongoose.Types.ObjectId; rating: number }[]> {
        const result = await Review.aggregate([
            {
                $group: {
                    _id: '$hostelId',
                    rating: { $avg: '$rating' }
                }
            },
            ...(rating > 0
                ? [{ $match: { rating: rating } }]
                : [])
        ]);

        return result.map(r => ({
            hostelId: r._id,
            rating: r.rating
        }));
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
            const host_id = new mongoose.Types.ObjectId(hostelData.host_id);
            let facilities: string[] = [];
            if (Array.isArray(hostelData.facilities)) {
                facilities = hostelData.facilities.flatMap(fac => fac.split(',')).map(f => f.trim().toLowerCase());
            } else if (typeof hostelData.facilities === 'string') {
                facilities = hostelData.facilities.split(',').map(f => f.trim().toLowerCase());
            }
            const addingHostelData = Object.assign(
                {
                    hostelname: hostelData.name,
                    location: hostelData.location,
                    nearbyaccess: hostelData.nearbyAccess,
                    beds: hostelData.bedsPerRoom,
                    totalRooms: hostelData.bedsPerRoom,
                    policies: hostelData.policies,
                    category: hostelData.category,
                    advanceamount: hostelData.advance,
                    facilities: facilities,
                    bedShareRoom: hostelData.bedShareRate,
                    isActive:true,
                    foodRate: hostelData.foodRate,
                    phone: hostelData.phoneNumber,
                    host_id: host_id,
                    longitude: Number(hostelData.longitude),
                    latitude: Number(hostelData.latitude),
                    cancellationPolicy: hostelData.cancellationPolicy
                },
                hostelData.photo ? { photos: hostelData.photo } : {}
            );

            const addingHostel = new Hostel(addingHostelData)
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

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const query: any = {
                host_id: id,
            };

            if (search && search.trim().length > 0) {
                const regex = new RegExp(search, 'i');
                query.$or = [
                    { hostelname: { $regex: regex } },
                    { location: { $regex: regex } },
                ];
            }
            const getHostel = await Hostel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
            const totalCount = await Hostel.countDocuments(query);
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
            await Hostel.findOneAndDelete({ _id: hostelId });
            return "Hostel Deleted"
        } catch (error) {
            return error as string;
        }
    }

    async updateHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            const facilities = Array.isArray(hostelData.facilities)
                ? hostelData.facilities.flatMap(f => f.split(',')).map(f => f.trim().toLowerCase())
                : hostelData.facilities.split(',').map(f => f.trim().toLowerCase());
            const existingHostel = await Hostel.findById(hostelData.hostelId);
            if (!existingHostel) {
                throw new Error('Hostel not found');
            }
            const currentTotalRooms = existingHostel.totalRooms || 0;
            const currentBeds = existingHostel.beds || 0;
            const additionalRooms = hostelData.bedsPerRoom || 0;
            const updatedTotalRooms = Number(currentTotalRooms) + Number(additionalRooms);
            const updatedBeds = Number(currentBeds) + Number(additionalRooms);
            const updateFields: any = {
                hostelname: hostelData.name,
                location: hostelData.location,
                nearbyaccess: hostelData.nearbyAccess,
                beds: updatedBeds,
                policies: hostelData.policies,
                category: hostelData.category,
                advanceamount: hostelData.advance,
                facilities: facilities,
                photos: hostelData.photo,
                longitude: Number(hostelData.longitude),
                latitude: Number(hostelData.latitude),
                cancellationPolicy: hostelData.cancellationPolicy,
                totalRooms: updatedTotalRooms
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

    async updateStatus(id: string, isActive: boolean, inactiveReason: string): Promise<string> {
        try {
            await Hostel.updateOne(
                { _id: id },
                {
                    $set: {
                        isActive: isActive,
                        inactiveReason: inactiveReason
                    }
                }
            )
            return 'Status Updated'
        } catch (error) {
            return error as string;
        }
    }

    async getAllHostel():Promise<IHostel[] | string>{
        try {
            const hostels = await Hostel.find();
            return hostels
        } catch (error) {
            return error as string;
        }
    } 
}

export default hostelRepository