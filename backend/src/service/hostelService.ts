import mongoose, { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import { IHostelService } from "../interface/hostel/!HostelService";
import { IUpdateHostelInput } from "../dtos/HostelData";
import { Messages } from "../messages/messages";
import { IOrderRepository } from "../interface/order/!OrderRepository";
import { getDistanceInKm } from "../utils/distance";
import { HostelDto } from "../dto/response/hosteldto";

function toPlainHostel(hostel: any) {
    return typeof hostel.toObject === 'function' ? hostel.toObject() : hostel;
}



class hostelService implements IHostelService {
    constructor(private _hostelRepository: IHostelRepository, private _orderRepository: IOrderRepository) { }


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
    ): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string> {
        try {
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            if (isNaN(pageNumber) || isNaN(limitNumber)) {
                return Messages.InvalidPaginationValues;
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
                ratedHostels = await this._hostelRepository.findAverageRatedHostelIds(filters.rating);
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
            if (Number(page) > 0 || Number(limit) > 0) {
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
                    inactiveReason: 1,
                    bedShareRoom: 1,
                    bookingType: 1
                }
            } else {
                projection = {
                    _id: 1,
                    hostelname: 1,
                    location: 1,
                    bedShareRoom: 1,
                    photos: 1,
                    rating: 1
                }
            }
            let allHostels = await this._hostelRepository.getHostels(query, projection, sortOption);
            if (lat && lng && radius) {
                allHostels = allHostels.filter((hostel) => {
                    if (typeof hostel.latitude === 'number' && typeof hostel.longitude === 'number') {
                        const distance = getDistanceInKm(lat, lng, hostel.latitude, hostel.longitude);
                        return distance <= radius;
                    }
                    return false;
                });
            }

            const today = new Date();
            allHostels = await Promise.all(
                allHostels.map(async (hostel) => {
                    const startDate = { $lte: today };
                    const endDate = { $gte: today }
                    const orderList = await this._orderRepository.findHostels({
                        hostel_id: hostel._id!,
                        active: true,
                        startDate,
                        endDate,
                    });
                    let bookedBeds = 0;
                    if (Array.isArray(orderList)) {
                        bookedBeds = orderList.reduce(
                            (sum, order) => sum + (order.selectedBeds || 0),
                            0
                        );
                    }
                    const isFull = bookedBeds >= hostel.totalRooms;

                    return { ...hostel, isFull };
                })
            );


            if (ratedHostels.length > 0) {
                allHostels = allHostels.map(hostel => {
                    const plainHostel = toPlainHostel(hostel);
                    const ratingEntry = ratedHostels.find(r => r.hostelId.toString() === plainHostel._id.toString());
                    return {
                        ...hostel,
                        rating: ratingEntry?.rating || 0
                    };
                });
            } else {
                const allRatings = await this._hostelRepository.findAverageRatedHostelIds(0);
                allHostels = allHostels.map(hostel => {
                    const plainHostel = toPlainHostel(hostel);
                    const ratingEntry = allRatings.find(r => r.hostelId.toString() === plainHostel._id.toString());
                    return {
                        ...hostel,
                        rating: ratingEntry?.rating || 0
                    };
                });
            }
            const totalCount = allHostels.length;
            const start = (pageNumber - 1) * limitNumber;
            let paginated: typeof allHostels;
            if (limitNumber > 0) {
                paginated = allHostels.slice(start, start + limitNumber);

            } else {
                paginated = allHostels
            }
            return { hostels: paginated, totalCount };
        } catch (err) {
            return err as string;
        }
    }

    async getSingleHostel(id: Types.ObjectId): Promise<(HostelDto & { isFull: boolean }) | string> {
        try {
            const hostel = await this._hostelRepository.getSingleHostel(id);
            if (!hostel) {
                return Messages.NoHostel;
            }

            if (typeof hostel === "string") {
                return hostel;
            }

            if (!hostel._id) {
                return Messages.NoHostelId
            }

            const today = new Date();
            const orders = await this._orderRepository.findHostel(hostel._id.toString(), today);

            if (typeof orders === "string") {
                return orders;
            }

            if (!orders) {
                const hostelDto = HostelDto.from({
                    _id: hostel._id,
                    hostelname: hostel.hostelname,
                    location: hostel.location,
                    facilities: hostel.facilities,
                    totalRooms: hostel.totalRooms,
                    photos: hostel.photos,
                    phone: hostel.phone,
                    category: hostel.category,
                    isFull: false
                });
                return hostelDto;
            }


            const bookedBeds = (orders.selectedBeds || 0);
            const isFull = bookedBeds >= hostel.totalRooms;

            const hostelObj = hostel.toObject();
            return HostelDto.from({ ...hostelObj, isFull });
        } catch (error) {
            return error as string
        }
    }

    async addHostel(hostData: IUpdateHostelInput): Promise<string> {
        try {
            const host_id = new mongoose.Types.ObjectId(
                typeof hostData.host_id === 'string'
                    ? hostData.host_id
                    : hostData.host_id instanceof mongoose.Types.ObjectId
                        ? hostData.host_id
                        : hostData.host_id._id
            );


            const addingHostelData = {
                hostelname: hostData.hostelname,
                location: hostData.location,
                nearbyaccess: hostData.nearbyaccess,
                beds: hostData.beds,
                totalRooms: hostData.beds,
                policies: hostData.policies,
                category: hostData.category,
                advanceamount: Number(hostData.advanceamount),
                facilities: hostData.facilities,
                bedShareRoom: hostData.bedShareRate ? Number(hostData.bedShareRate) : undefined,
                isFull: false,
                isActive: true,
                foodRate: Number(hostData.foodRate),
                phone: Number(hostData.phone),
                host_id: host_id,
                longitude: Number(hostData.longitude),
                latitude: Number(hostData.latitude),
                cancellationPolicy: hostData.cancellationPolicy.toLowerCase(),
                bookingType: hostData.bookingType,
                photos: Array.isArray(hostData.photos)
                    ? hostData.photos
                    : hostData.photos
                        ? [hostData.photos]
                        : [],
            };
            console.log(addingHostelData, 'Service')
            const response = await this._hostelRepository.addHostel(addingHostelData);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string, sort?: string): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string> {
        try {
            let sortOption: any = { createdAt: -1 };
            switch (sort) {
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
            const response = await this._hostelRepository.getHostHostels(id, limit, skip, search, sortOption);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async deleteHostel(hostelId: string): Promise<string> {
        try {
            const response = await this._hostelRepository.deleteHostel(hostelId);
            return response;
        } catch (error) {
            return error as string;
        }
    }

    async updateHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {

            const hostelId = new mongoose.Types.ObjectId(hostelData.hostelId);
            const existingHostel = await this._hostelRepository.getOneHostel(hostelId);
            if (!existingHostel) {
                throw new Error(Messages.HostelNotFound);
            }

            if (typeof existingHostel === "string") {
                throw new Error(existingHostel);
            }


            const currentTotalRooms = existingHostel.totalRooms || 0;
            const currentBeds = Number(existingHostel.beds) || 0;
            const additionalRooms = Number(hostelData.beds) || 0;

            let updatedTotalRooms = 0;
            let updatedBeds: number = 0
            if (Number(currentBeds) == Number(additionalRooms)) {
                updatedBeds = currentBeds;
                updatedTotalRooms = currentTotalRooms;
            } else {
                updatedBeds = Number(currentBeds) + Number(additionalRooms);
                updatedTotalRooms = (currentTotalRooms) + Number(additionalRooms);

            }
            console.log(updatedBeds, "UpdatedBeds")
            const updateFields: any = {
                hostelname: hostelData.hostelname,
                location: hostelData.location,
                nearbyaccess: hostelData.nearbyaccess,
                beds: updatedBeds,
                policies: hostelData.policies,
                category: hostelData.category,
                advanceamount: hostelData.advanceamount,
                facilities: hostelData.facilities,
                photos: hostelData.photos,
                longitude: Number(hostelData.longitude),
                latitude: Number(hostelData.latitude),
                cancellationPolicy: hostelData.cancellationPolicy,
                totalRooms: updatedTotalRooms,
                bookingType: hostelData.bookingType
            };
            console.log(updateFields, 'updateFieds')

            if (hostelData.facilities.food) {
                updateFields.foodRate = hostelData.foodRate;
            }

            if (!hostelData.hostelId) {
                throw new Error("Hostel ID is required for update.");
            }

            const response = await this._hostelRepository.updateHostel(hostelData.hostelId, updateFields);
            return response;
            // const response = await this._hostelRepository.updateHostel(hostelData);
            // return response;
        } catch (error) {
            return error as string;
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | string> {
        try {
            const response = await this._hostelRepository.getOneHostel(id)
            return response;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async updateStatus(id: string, isActive: boolean, inactiveReason: string): Promise<string> {
        try {
            const response = await this._hostelRepository.updateStatus(id, isActive, inactiveReason);
            return response
        } catch (error) {
            return error as string;
        }
    }

    async getAllHostel(): Promise<IUpdateHostelInput[] | string> {
        try {
            const response = await this._hostelRepository.getAllHostel();
            return response;
        } catch (error) {
            return error as string;
        }
    }
}

export default hostelService