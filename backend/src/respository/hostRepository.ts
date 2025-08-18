import mongoose, { Types } from "mongoose";
import { IHostRepository } from "../interface/host/!HostRepository";
import { generateAccessToken, generateRefreshToken } from "../Jwt/jwt";
import Host, { IHost } from "../model/hostModel";
import Otp, { IOtp } from "../model/otpModel";
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt';
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import Hostel, { IHostel } from "../model/hostelModel";
import Category, { ICategory } from "../model/categoryModel";
import User, { IUser } from "../model/userModel";
import baseRepository from "./baseRespository";
import { IHostResponse } from "../dtos/HostResponse";
import { Messages } from "../messages/messages";
import { IUpdateHostelInput } from "../dtos/HostelData";
import { ProjectionType } from "mongoose";


interface hostData {
    name: string,
    mobile: number,
    email: string,
    password?: string
}

interface otpData {
    email: string,
    otp: number
}

interface HostData {
    email?: string,
    name?: string,
    password?: string,
    mobile?: string
}

class hostRepository extends baseRepository<IHost> implements IHostRepository {
    constructor() {
        super(Host)
    }

    async findHostByEmail(email: string): Promise<IHostResponse | null> {
        try {
            const hostData = await this.findByEmail({ email }) as IHostResponse | null;
            return hostData
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async updateOtp(email: string, otp: number): Promise<void> {
        await Otp.updateOne({ email }, { $set: { otp } });
    }

    async createOtp(email: string, otp: number): Promise<IOtp> {
        return await Otp.create({ email, otp });
    }

    async findOtpByEmail(email: string): Promise<IOtp | null> {
        return await Otp.findOne({ email });
    }

    async insertHost(hostData: Partial<IHost>): Promise<string | null> {
        try {
            const newHost = new Host(hostData);
            await newHost.save();
            return Messages.Added
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async otpGenerating(email: string, otp: number): Promise<void> {
        try {
            const exisitingOtp = await Otp.findOne({ email })
            if (exisitingOtp) {
                exisitingOtp.otp = otp
                await exisitingOtp.save()
            } else {
                const otpsave = new Otp({
                    email: email,
                    otp: otp
                })
                await otpsave.save();
            }
        } catch (error) {
            console.log(error)
        }
    }




    async createHost(hostData: { email: string }): Promise<string> {
        try {
            const checkingOtp = await Otp.findOne({ email: hostData.email });
            const email = hostData.email
            const checkingHost = await Host.findOne({ email })
            if (checkingHost && checkingOtp) {
                checkingHost.temp = false;
                checkingHost.tempExpires = undefined;
                await checkingHost.save();
                return Messages.success;
            }
            return Messages.OtpExpired;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }> {
        try {
            const existingHost = await Host.findOne({ email: hostData.email });

            if (!existingHost || !existingHost.password) {
                return { message: Messages.UserNotFoundOrPassword };
            }

            if (typeof hostData.password !== 'string') {
                return { message: Messages.InvalidPasswordFormat };
            }

            const isMatch = await bcrypt.compare(hostData.password, existingHost.password);
            if (isMatch) {
                return { message: Messages.SamePassword };
            } else {
                const hashedPassword = await bcrypt.hash(hostData.password, 10);
                existingHost.password = hashedPassword;
                existingHost.tempExpires = undefined;
                await existingHost.save();
                return { message: Messages.PasswordChanged };
            }
        } catch (error) {
            console.log(error);
            return { message: error as string };
        }
    }


    async verifyLogin(hostData: { email: string, password: string }): Promise<{ message: string, accessToken?: string, refreshToken?: string }> {
        try {
            const checkhost = await Host.findOne({ email: hostData.email });

            if (checkhost && checkhost.isBlock !== true) {
                const isMatch = await bcrypt.compare(hostData.password, checkhost.password);

                if (isMatch) {
                    const hostPayload: hostPayload = {
                        _id: checkhost._id as Types.ObjectId,
                        role: 'host'
                    };

                    const accessToken = generateAccessToken(hostPayload);
                    const refreshToken = generateRefreshToken(hostPayload);
                    // console.log(refreshToken,'Repository')
                    return { message: Messages.Success, accessToken, refreshToken };
                } else {
                    return { message: Messages.InvalidPassword };
                }
            } else if (checkhost?.isBlock === true) {
                return { message: Messages.HostIsBlocked };
            } else {
                return { message: Messages.InvalidEmail };
            }
        } catch (error) {
            return { message: error as string };
        }
    }


    async getAllHostels(): Promise<IHostel[] | string> {
        try {
            const getHostel = await Hostel.find();
            return getHostel;
        } catch (error) {
            return error as string
        }
    }

    async newHost({ hostels, host_id, }: { hostels: IHostel[]; host_id: Types.ObjectId; }): Promise<string> {
        try {
            const hostApproved = await Host.findOne({ _id: host_id })
            if (hostApproved) {
                if (hostApproved?.approvalRequest == '3') {
                    return Messages.Containing;
                }
            } else {
                const isHostIdPresent = hostels.some((hostel) => hostel.host_id.equals(host_id));
                if (isHostIdPresent) {
                    return Messages.Containing;
                }
                else {
                    return Messages.NotContaining;
                }



            }

            return Messages.HostIdNotFound;

        } catch (error) {
            return error as string
        }
    }

    async approvalRequest(host_id: Types.ObjectId): Promise<string> {
        try {
            await Host.updateOne(
                { _id: host_id },
                { $set: { approvalRequest: "2" } }
            )
            return Messages.Approved;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }



    async addGoogleHost(hostData: Partial<IHost>): Promise<{ message: string, host?: IHostResponse } | string> {
        try {
            const alreadyHost = await Host.findOne({ email: hostData.email }) as IHostResponse;
            if (alreadyHost) {
                return { message: Messages.Already, host: alreadyHost }
            }

            const newHost = new Host({
                name: hostData.name,
                email: hostData.email,
                password: hostData.password,
                mobile: hostData.mobile,
                temp: false
            })

            newHost.set('tempExpires', undefined);

            await newHost.save();

            const hostFind: IHostResponse | null = await Host.findOne({ email: hostData.email });

            if (hostFind === null) {
                return { message: Messages.HostNotFound }
            }

            return { message: Messages.Success, host: hostFind }

        } catch (error) {
            return error as string
        }
    }

    async findHostById(id: Types.ObjectId, projection?: ProjectionType<IHost>): Promise<IHost | string> {
        try {
            const findHost = await this.findById(id, projection) as IHost | null;
            if (!findHost) {
                return "No host"
            }
            return findHost
        } catch (error) {
            console.log(error);
            return error as string
        }
    }



    async getAllCategory(): Promise<ICategory[] | string> {
        try {
            const getAllCategories = await Category.find();
            return getAllCategories
        } catch (error) {
            return error as string
        }
    }

    async uploadDocument(host_id: Types.ObjectId, photo: string | undefined, documentType: string): Promise<string> {
        try {
            const updateHost = await Host.findOneAndUpdate(
                { _id: host_id },
                {
                    $set:
                    {
                        photo: photo,
                        documentType: documentType,
                        temp: false,
                        tempExpires: undefined
                    }
                }
            )
            if (updateHost) {
                return Messages.DocumentUpdated;
            }
            return Messages.DocumentNotUpdated;
        } catch (error) {
            return error as string
        }
    }


    async changePassword(hostData: { hostId: Types.ObjectId; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            const findHost = await Host.findOne({ _id: hostData.hostId })
            if (!findHost) {
                return Messages.NoHosts;
            }
            const checkPassword = await bcrypt.compare(hostData.currentPassword, findHost.password)
            if (checkPassword) {
                const samePassword = await bcrypt.compare(hostData.newPassword, findHost.password)
                if (samePassword) {
                    return Messages.NewPasswordCannotbeSame;
                } else {
                    const hashedPassword = await bcrypt.hash(hostData.newPassword, 10);
                    await Host.updateOne(
                        { _id: hostData.hostId },
                        {
                            $set:
                                { password: hashedPassword }
                        }
                    )
                    return Messages.PasswordChanged;
                }
            } else {
                return Messages.CurrentPasswordDoesNotMatch;
            }
        } catch (error) {
            return error as string
        }
    }

    async editProfile(hostData: { hostId: Types.ObjectId, name: string, mobile: string }): Promise<string> {
        try {
            const updatingHostDetails = await Host.updateOne(
                { _id: hostData.hostId },
                {
                    $set: {
                        name: hostData.name,
                        mobile: hostData.mobile
                    }
                }
            )
            if (updatingHostDetails.matchedCount == 1) {
                return Messages.HostDetailsUpdated;
            } else {
                return Messages.NotUpdated;
            }
        } catch (error) {
            return error as string
        }
    }

    async getAllUsers(): Promise<IUser[] | string | null> {
        try {
            const allUsers = await User.find({ isAdmin: false });
            return allUsers
        } catch (error) {
            return error as string
        }
    }

    async allHost(): Promise<IHostResponse[] | string | null> {
        try {
            const getHost = await Host.find().lean<IHostResponse[]>();
            return getHost;
        } catch (error) {
            return error as string
        }
    }

    async getHost(skip: number, limit: number): Promise<{ hosts: IHostResponse[]; totalCount: number } | null> {
        try {
            const projection = {
                _id: 1,
                name: 1,
                mobile: 1,
                isAdmin: 1,
                isBlock: 1,
                email: 1,
                approvalRequest: 1,
                photo: 1,
                documentType: 1
            }
            const hosts = await Host.find({}, projection).skip(skip).limit(limit).lean<IHostResponse[]>();
            const totalCount = await Host.countDocuments()

            return { hosts, totalCount };
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async approveHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {
            const result = await Host.findByIdAndUpdate(
                { _id: hostId },
                { $set: { approvalRequest: 3 } },
                { new: true }
            )
            if (result) {
                return Messages.Approved;
            } else {
                return Messages.NotApproved;
            }
        } catch (error) {
            return error as string
        }
    }

    async searchHost(name: string): Promise<IHostResponse[] | string | null> {
        try {
            const hosts = await Host.find({
                name: { $regex: `^${name}`, $options: 'i' }
            }).lean<IHostResponse[]>()
            return hosts
        } catch (error) {
            return error as string
        }
    }

    async getHostHostelData(hostId: string): Promise<IUpdateHostelInput[] | string | null> {
        try {
            const findHostHostel = await Hostel.find({ host_id: hostId }).lean<IUpdateHostelInput[]>();
            return findHostHostel;
        } catch (error) {
            return error as string
        }
    }

    async getHostDetails(userId: string): Promise<string | IHostResponse | null> {
        try {
            const projection = {
                _id: 1,
                name: 1,
                mobile: 1,
                isAdmin: 1,
                isBlock: 1,
                email: 1,
                approvalRequest: 1,
                photo: 1,
                documentType: 1
            }
            const getUserData = await Host.findOne({ _id: userId }, projection).lean<IHostResponse>();
            return getUserData;
        } catch (error) {
            return error as string
        }
    }

    async rejectHost(hostId: mongoose.Types.ObjectId): Promise<string> {
        try {
            const result = await Host.findByIdAndUpdate(
                { _id: hostId },
                { $set: { approvalRequest: 1 } },
                { new: true }
            )
            if (result) {
                return Messages.Reject
            }
            return Messages.NotReject
        } catch (error) {
            return error as string
        }
    }

    async hostDelete(hostId: Types.ObjectId): Promise<string> {
        try {
            await Host.findByIdAndDelete(hostId);
            return Messages.HostDeleted
        } catch (error) {
            console.log(error);
            return error as string;
        }
    }

    async hostBlock(hostId: Types.ObjectId): Promise<string> {
        try {
            await Host.updateOne(
                { _id: hostId },
                { $set: { isBlock: true } }
            )
            return Messages.Blocked
        } catch (error) {
            return error as string
        }
    }

    async hostUnBlock(hostId: Types.ObjectId): Promise<string> {
        try {
            await Host.updateOne(
                { _id: hostId },
                { $set: { isBlock: false } }
            )
            return Messages.Unblocked
        } catch (error) {
            return error as string
        }
    }

    async getHostels(): Promise<IHostel[] | string | null> {
        try {
            const findHostel = await Hostel.find().populate('host_id');
            if (findHostel.length == 0) {
                return Messages.NotHostel
            }
            return findHostel
        } catch (error) {
            return error as string
        }
    }

    async createGoogleAuth(data: { email: string, name: string, userType: string, mobile: string }): Promise<string> {
        try {
            const createHost = new Host({
                email: data.email,
                name: data.name,
                hostType: data.userType,
                mobile: data.mobile,
                tempExpires: null,
            })
            await createHost.save()
            return (createHost._id as Types.ObjectId).toString();
        } catch (error) {
            return error as string
        }
    }
}

export default hostRepository