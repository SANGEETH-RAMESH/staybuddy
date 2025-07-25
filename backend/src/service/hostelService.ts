import { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import { IHostelService } from "../interface/hostel/!HostelService";
import { IHostel } from "../model/hostelModel";
import { IUpdateHostelInput } from "../dtos/HostelData";

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




class hostelService implements IHostelService {
    constructor(private hostelRepository: IHostelRepository) { }


    async getHostels(
        page: string,
        limit: string,
        search: string = '',
        lat?: number,
        lng?: number,
        radius?: number,
        filters?: {
            rating?: number;
            facilities?: string[];
            minPrice?: number;
            maxPrice?: number;
            sort?: string;
        }
    ): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                return 'Invalid pagination values';
            }

            const query: Record<string, any> = {};
            let ratedHostels: { hostelId: any; rating: number }[] = [];

            if (search.trim()) {
                const regex = new RegExp(search, 'i');
                query.$or = [
                    { hostelname: { $regex: regex } },
                    { location: { $regex: regex } }
                ];
            }

            if (filters?.rating) {
                ratedHostels = await this.hostelRepository.findAverageRatedHostelIds(filters.rating);
                const hostelIds = ratedHostels.map(item => item.hostelId);
                query._id = { $in: hostelIds };
            }

            if (filters?.facilities?.length) {
                query.facilities = { $all: filters.facilities };
            }

            if (filters?.minPrice !== undefined && filters?.maxPrice !== undefined) {
                query.bedShareRoom = {
                    $gte: filters.minPrice,
                    $lte: filters.maxPrice
                };
            }

            let sortOption: any = { createdAt: -1 };
            switch (filters?.sort) {
                case 'price_low_high':
                    sortOption = { bedShareRoom: 1 };
                    break;
                case 'price_high_low':
                    sortOption = { bedShareRoom: -1 };
                    break;
                case 'name_a_z':
                    sortOption = { hostelname: 1 };
                    break;
                case 'name_z_a':
                    sortOption = { hostelname: -1 };
                    break;
            }
            let projection: any
            if ( Number(page) > 0 || Number(limit) > 0  ) {
                projection = {
                    _id: 1,
                    totalRooms: 1,
                    isActive: 1,
                    latitude: 1,
                    longitude: 1,
                    photos: 1,
                    cancellationPolicy: 1,
                    hostelname: 1,
                    location: 1,
                    facilities: 1,
                    phone: 1,
                    inactiveReason:1,
                    bedShareRoom:1
                }
            } else {
                projection = {
                    _id: 1,
                    hostelname: 1,
                    location: 1,
                    bedShareRoom: 1,
                    photos: 1,
                    rating:1
                }
            }
            let allHostels = await this.hostelRepository.getHostels(query, projection, sortOption);
            if (lat && lng && radius) {
                allHostels = allHostels.filter((hostel) => {
                    if (typeof hostel.latitude === 'number' && typeof hostel.longitude === 'number') {
                        const distance = getDistanceInKm(lat, lng, hostel.latitude, hostel.longitude);
                        return distance <= radius;
                    }
                    return false;
                });
            }
            if (ratedHostels.length > 0) {
                allHostels = allHostels.map(hostel => {
                    const plainHostel = hostel.toObject?.() || hostel;
                    const ratingEntry = ratedHostels.find(r => r.hostelId.toString() === plainHostel._id.toString());
                    return {
                        ...hostel.toObject?.() || hostel,
                        rating: ratingEntry?.rating || 0
                    };
                });
            } else {
                const allRatings = await this.hostelRepository.findAverageRatedHostelIds(0);
                allHostels = allHostels.map(hostel => {
                    const plainHostel = hostel.toObject?.() || hostel;
                    const ratingEntry = allRatings.find(r => r.hostelId.toString() === plainHostel._id.toString());
                    return {
                        ...hostel.toObject?.() || hostel,
                        rating: ratingEntry?.rating || 0
                    };
                });
            }
            const totalCount = allHostels.length;
            const start = (pageNumber - 1) * limitNumber;
            let paginated: typeof allHostels;
            if(start>0 && limitNumber>0){
             paginated = allHostels.slice(start, start + limitNumber);

            }else{
                paginated  = allHostels
            }

            return { hostels: paginated, totalCount };
        } catch (err) {
            return err as string;
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
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IHostel[]; totalCount: number } | string> {
        try {
            const response = await this.hostelRepository.getHostHostels(id, limit, skip, search);
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

    async updateStatus(id: string, isActive: boolean, inactiveReason: string): Promise<string> {
        try {
            const response = await this.hostelRepository.updateStatus(id, isActive, inactiveReason);
            return response
        } catch (error) {
            return error as string;
        }
    }

    async getAllHostel(): Promise<IHostel[] | string> {
        try {
            const response = await this.hostelRepository.getAllHostel();
            return response;
        } catch (error) {
            return error as string;
        }
    }
}

export default hostelService