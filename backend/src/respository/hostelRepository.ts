import mongoose, { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import Hostel, { IHostel } from "../model/hostelModel";
import baseRepository from "./baseRespository";
import { IUpdateHostelInput } from "../dtos/HostelData";
import Review from "../model/reviewModel";
import Order from "../model/orderModel";
import { Messages } from "../messages/messages";

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

    async getHostels(query: Record<string, any>, projection?: IUpdateHostelInput, sortOption: any = {}): Promise<(IUpdateHostelInput & { isFull: boolean })[]> {

        const hostels = await Hostel.find(query, projection).sort(sortOption).lean<IUpdateHostelInput[]>();

        const today = new Date();

        const hostelsWithIsFull = await Promise.all(
            hostels.map(async (hostel) => {
                const orderList = await Order.find({
                    hostel_id: hostel._id,
                    active: true,
                    startDate: { $lte: today },
                    endDate: { $gte: today },
                });

                let bookedBeds = 0;
                orderList.forEach((order) => {
                    bookedBeds += order.selectedBeds || 0;
                });

                const isFull = bookedBeds >= hostel.totalRooms;

                return {
                    ...hostel,
                    isFull,
                } as IUpdateHostelInput & { isFull: boolean };
            })
        );

        return hostelsWithIsFull;
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

    async getSingleHostel(id: Types.ObjectId): Promise<(IUpdateHostelInput & { isFull: boolean }) | string> {
        try {
            const getHostel = await Hostel.findOne({ _id: id }).populate('host_id')
            if (!getHostel) {
                return Messages.NoHostel
            }
            const today = new Date();

            const orderList = await Order.find({
                hostel_id: getHostel._id,
                active: true,
                startDate: { $lte: today },
                endDate: { $gte: today }
            });

            let bookedBeds = 0;
            orderList.forEach(order => {
                bookedBeds += order.selectedBeds || 0;
            });

            const isFull = bookedBeds >= getHostel.totalRooms;
            const order = await Order.find({ hostel_id: getHostel._id })
            return { ...getHostel.toObject(), isFull } as IUpdateHostelInput & { isFull: boolean };
        } catch (error) {
            return error as string
        }
    }

    async addHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            const host_id = new mongoose.Types.ObjectId(
                typeof hostelData.host_id === 'string'
                    ? hostelData.host_id
                    : hostelData.host_id instanceof mongoose.Types.ObjectId
                        ? hostelData.host_id
                        : hostelData.host_id._id
            );
            let facilities: string[] = [];
            if (Array.isArray(hostelData.facilities)) {
                facilities = hostelData.facilities.flatMap(fac => fac.split(',')).map(f => f.trim().toLowerCase());
            } else if (typeof hostelData.facilities === 'string') {
                facilities = hostelData.facilities.split(',').map((f: string) => f.trim().toLowerCase());
            }
            console.log(hostelData,'Hostelllllll')
            const addingHostelData = Object.assign(
                {
                    hostelname: hostelData.hostelname,
                    location: hostelData.location,
                    nearbyaccess: hostelData.nearbyaccess,
                    beds: hostelData.beds,
                    totalRooms: hostelData.beds,
                    policies: hostelData.policies,
                    category: hostelData.category,
                    advanceamount: hostelData.advanceamount,
                    facilities: facilities,
                    bedShareRoom: hostelData.bedShareRate,
                    isActive: true,
                    foodRate: hostelData.foodRate,
                    phone: hostelData.phoneNumber,
                    host_id: host_id,
                    longitude: Number(hostelData.longitude),
                    latitude: Number(hostelData.latitude),
                    cancellationPolicy: hostelData.cancellationPolicy
                },
                hostelData.photos ? { photos: hostelData.photos } : {}
            );

            const addingHostel = new Hostel(addingHostelData)
            if (addingHostel) {
                await addingHostel.save();
                return Messages.HostelAdded;
            } else {
                return Messages.HostelNotAdded;
            }
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string> {
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
                .lean<IUpdateHostelInput[]>()
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
            const hostRemoving = await Hostel.findOneAndDelete(
                { _id: hostelId }
            )
            if (hostRemoving) {
                return Messages.HostelDeleted
            }
            return Messages.HostelNotDeleted
        } catch (error) {
            return error as string
        }
    }

    async updateHostel(hostelData: IUpdateHostelInput): Promise<string> {
        try {
            const facilities = Array.isArray(hostelData.facilities)
                ? hostelData.facilities.flatMap(f => f.split(',')).map(f => f.trim().toLowerCase())
                : hostelData.facilities.split(',').map(f => f.trim().toLowerCase());
            const existingHostel = await Hostel.findById(hostelData.hostelId);
            if (!existingHostel) {
                throw new Error(Messages.HostelNotFound);
            }
            const currentTotalRooms = existingHostel.totalRooms || 0;
            const currentBeds = existingHostel.beds || 0;
            const additionalRooms = hostelData.beds || 0;
            const updatedTotalRooms = Number(currentTotalRooms) + Number(additionalRooms);
            const updatedBeds = Number(currentBeds) + Number(additionalRooms);
            const updateFields: any = {
                hostelname: hostelData.hostelname,
                location: hostelData.location,
                nearbyaccess: hostelData.nearbyaccess,
                beds: updatedBeds,
                policies: hostelData.policies,
                category: hostelData.category,
                advanceamount: hostelData.advanceamount,
                facilities: facilities,
                photos: hostelData.photos,
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

            return Messages.HostelUpdateSuccess;
        } catch (error) {
            return error as string;
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | string> {
        try {
            const hostelFind = await Hostel.findOne({ _id: id }).populate('host_id').lean<IUpdateHostelInput>();
            if (hostelFind) {
                return hostelFind
            } else {
                return Messages.HostelNotFound;
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
            return Messages.StatusUpdated;
        } catch (error) {
            return error as string;
        }
    }

    async getAllHostel(): Promise<IUpdateHostelInput[] | string> {
        try {
            const hostels = await Hostel.find().populate('host_id').lean<IUpdateHostelInput[]>();
            return hostels
        } catch (error) {
            return error as string;
        }
    }

    async searchHostel(name: string): Promise<IUpdateHostelInput[] | string | null> {
        try {
            const hostels = await Hostel.find({
                hostelname: { $regex: `^${name}`, $options: 'i' }
            }).populate('host_id')
            .lean<IUpdateHostelInput[]>()
            return hostels
        } catch (error) {
            return error as string
        }
    }

    async getAllHostels(page: string, limit: string): Promise<{ hostels: IUpdateHostelInput[], totalCount: number; } | string | null> {
        try {
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            const hostels = await Hostel.find()
                .skip(limitNumber * (pageNumber - 1))
                .limit(limitNumber)
                .populate('host_id')
                .lean<IUpdateHostelInput[]>();
            const totalCount = await Hostel.countDocuments();

            return { hostels, totalCount };
        } catch (error) {
            return error as string;
        }
    }
}

export default hostelRepository