import mongoose, { Types } from "mongoose";
import { IHostelRepository } from "../interface/hostel/!HostelRepository";
import Hostel, { IHostel } from "../model/hostelModel";
import baseRepository from "./baseRespository";
import { IUpdateHostelInput } from "../dtos/HostelData";
import Review from "../model/reviewModel";
import { Messages } from "../messages/messages";
import { FilterQuery, SortOrder } from "mongoose";





class hostelRepository extends baseRepository<IHostel> implements IHostelRepository {
    constructor() {
        super(Hostel)
    }

    async getHostels(query: FilterQuery<IUpdateHostelInput>, projection?: Partial<IUpdateHostelInput>, sortOption: Record<string, SortOrder> = {}): Promise<IUpdateHostelInput[]> {

        return await Hostel.find(query, projection).sort(sortOption).lean<IUpdateHostelInput[]>();


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

    async getSingleHostel(id: Types.ObjectId): Promise<IHostel | null | string> {
        try {
            const response = await Hostel.findOne({ _id: id }).populate('host_id');
            return response
        } catch (error) {
            return error as string
        }
    }

    async addHostel(data: Partial<IHostel>): Promise<string> {
        try {
            console.log(data, 'Repo')
            const hostel = new Hostel(data as IHostel);
            await hostel.save();
            return Messages.HostelAdded;

        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHostHostels(id: Types.ObjectId, limit: number, skip: number, search: string, sort?: string): Promise<{ hostels: IUpdateHostelInput[]; totalCount: number } | string> {
        try {
            const query: FilterQuery<IUpdateHostelInput> = {
                host_id: id,
            };
            if (search && search.trim().length > 0) {
                const regex = new RegExp(search, 'i');
                query.$or = [
                    { hostelname: { $regex: regex } },
                    { location: { $regex: regex } },
                ];
            }
            const hostel = await Hostel.find()
            console.log(hostel[0])
            const getHostel = await Hostel.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('host_id')
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

    async updateHostel(id: string, updateFields: Partial<IUpdateHostelInput>): Promise<string> {
        try {
            await Hostel.updateOne({ _id: id }, { $set: updateFields });
            return Messages.HostelUpdateSuccess;
        } catch (error) {
            return error as string;
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IUpdateHostelInput | string> {
        try {
            const hostelFind = await Hostel.findOne({ _id: id })
            .populate('host_id')
            .lean<IUpdateHostelInput>();
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