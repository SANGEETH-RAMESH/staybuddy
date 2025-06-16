import mongoose, { Types } from "mongoose";
import { IHostRepository } from "../interface/host/!HostRepository";
// import generateToken from "../Jwt/jwt";
import { generateAccessToken, generateRefreshToken } from "../Jwt/jwt";
import Host, { IHost } from "../model/hostModel";
import Otp from "../model/otpModel";
import HashedPassword from "../utils/hashedPassword";
import bcrypt from 'bcrypt';
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import Hostel, { IHostel } from "../model/hostelModel";
import Wallet, { IWallet } from "../model/walletModel";
import Category, { ICategory } from "../model/categoryModel";
import Order, { IOrder } from "../model/orderModel";
import User, { IUser } from "../model/userModel";
import baseRepository from "./baseRespository";


interface HostelData {
    name: string,
    location: string,
    nearbyAccess: string,
    bedsPerRoom: number,
    policies: string,
    category: string,
    advance: number,
    facilities: string[],
    bedShareRate: number,
    foodRate: number,
    phoneNumber: string,
    photo: string[],
    host_id: string
}

interface hostData {
    name: string,
    mobile: number,
    email: string,
    password: string
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

    async FindHostByEmail(email: string): Promise<IHost | null> {
        try {
            const hostData = await this.findByEmail({ email })
            return hostData
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async OtpGenerating(email: string, otp: number): Promise<void> {
        try {
            const existingOtp = await Otp.findOne({ email });
            if (existingOtp) {
                existingOtp.otp = otp;
                await existingOtp.save();
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

    async tempStoreHost(hostData: hostData): Promise<void> {
        try {
            const alreadyHost = await Host.findOne({ email: hostData.email });
            if (!alreadyHost) {
                const hashedPassword = await HashedPassword.hashPassword(hostData.password);
                const tempAddingHost = new Host({
                    name: hostData?.name,
                    mobile: hostData?.mobile,
                    email: hostData.email,
                    password: hashedPassword,
                    temp: true
                })
                await tempAddingHost.save();
            }
        } catch (error) {
            console.log(error)
        }
    }

    async otpChecking(hostData: otpData): Promise<string> {
        try {
            const host = await Otp.findOne({ email: hostData.email })
            if (!host) {
                return 'User not found';
            }

            if (host?.otp === hostData.otp) {
                return "Host verified"
            } else {
                return "not verified"
            }

        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async CreateHost(hostData: { email: string }): Promise<string> {
        try {
            const checkingOtp = await Otp.findOne({ email: hostData.email });
            const email = hostData.email
            const checkingHost = await this.findByEmail({ email })
            if (checkingHost && checkingOtp) {
                checkingHost.temp = false;
                checkingHost.tempExpires = undefined;
                await checkingHost.save();
                return "success"
            }
            return 'otp expired'
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }> {
        try {
            console.log("hello")
            const existingHost = await Host.findOne({ email: hostData.email });

            if (!existingHost || !existingHost.password) {
                return { message: "User not found or password" };
            }

            if (typeof hostData.password !== 'string') {
                return { message: "Invalid password format" };
            }

            const isMatch = await bcrypt.compare(hostData.password, existingHost.password);
            console.log(isMatch, 'ismatch')
            if (isMatch) {
                return { message: "Same password" };
            } else {
                const hashedPassword = await bcrypt.hash(hostData.password, 10);
                existingHost.password = hashedPassword;
                existingHost.tempExpires = undefined;
                await existingHost.save();
                return { message: "Password Changed" };
            }
        } catch (error) {
            console.log(error);
            return { message: "An unexpected error occurred" };
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
                        name: checkhost.name,
                        email: checkhost.email,
                        mobile: String(checkhost.mobile)
                    };

                    const accessToken = generateAccessToken(hostPayload);
                    const refreshToken = generateRefreshToken(hostPayload);
                    // console.log(refreshToken,'Repository')
                    return { message: "Success", accessToken, refreshToken };
                } else {
                    return { message: "Invalid password" };
                }
            } else if (checkhost?.isBlock === true) {
                return { message: "Host is blocked" };
            } else {
                return { message: "Invalid email" };
            }
        } catch (error) {
            console.error("Error verifying login:", error);
            return { message: "Internal server error" };
        }
    }



    async addHostel(hostelData: HostelData): Promise<string> {
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

    async getHostels(id: Types.ObjectId): Promise<IHostel[] | string> {
        try {
            const getHostel = await Hostel.find({ host_id: id });
            return getHostel;
        } catch (error) {
            return error as string
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
            console.log("Type of hostel.host_id:", typeof hostels[0].host_id, hostels[0].host_id);
            console.log("Type of host_id:", typeof host_id, host_id);
            const hostApproved = await Host.findOne({ _id: host_id })
            if (hostApproved) {
                if (hostApproved?.approvalRequest == '3') {
                    return "Containing"
                }
            } else {
                const isHostIdPresent = hostels.some((hostel) => hostel.host_id.equals(host_id));
                if (isHostIdPresent) {
                    return "Containing"
                }
                else {
                    return "Not containing"
                }



            }

            return "Host ID not found"

        } catch (error) {
            return error as string
        }
    }

    async approvalRequest(host_id: Types.ObjectId): Promise<string> {
        try {
            // const hostt = await Host.find();
            // const hostFind = await Host.findOne({_id:host_id});
            await Host.updateOne(
                { _id: host_id },
                { $set: { approvalRequest: "2" } }
            )
            return "Approved"
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            // console.log(req.query.id);
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

    async addGoogleHost(hostData: HostData): Promise<{ message: string, host?: IHost } | string> {
        try {
            const alreadyHost = await Host.findOne({ email: hostData.email });
            if (alreadyHost) {
                return { message: "Already", host: alreadyHost }
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

            const hostFind: IHost | null = await Host.findOne({ email: hostData.email });

            if (hostFind === null) {
                return { message: "Host not found" }
            }

            return { message: 'Success', host: hostFind }

        } catch (error) {
            return error as string
        }
    }

    async findHostById(id: Types.ObjectId): Promise<IHost | string> {
        try {
            const findHost = await Host.findById(id);
            if (!findHost) {
                return "No host"
            }
            return findHost
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async createWallet(email: string): Promise<string> {
        try {
            const findHost = await Host.findOne({ email: email })
            if (!findHost) {
                return "Host not found"
            }
            const creatingWallet = new Wallet({
                userOrHostId: findHost._id
            })
            await creatingWallet.save()

            findHost.wallet_id = creatingWallet._id as mongoose.Types.ObjectId;
            findHost.tempExpires = undefined;
            findHost.temp = false;
            await findHost.save();
            return 'success'
        } catch (error) {
            console.log(error)
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
                return "Documnent Updated"
            }
            return "Document Not Updated"
        } catch (error) {
            return error as string
        }
    }

    async findHostWallet(id: string): Promise<IWallet | string | null> {
        try {
            console.log(id)
            console.log(typeof id)
            const hostId = new mongoose.Types.ObjectId(id)
            const hostWallet = await Wallet.aggregate([
                { $match: { userOrHostId: hostId } }
            ])
            if (!hostWallet) {
                return "No Wallet"
            }
            return hostWallet[0]
        } catch (error) {
            return error as string
        }
    }

    async getBookings(hostId: string): Promise<IOrder[] | string | null> {
        try {
            const getBookings = await Order.find({ host_id: hostId })
                .populate("host_id")
                .populate("userId")
                .populate("hostel_id.id");
            console.log(getBookings)
            return getBookings
        } catch (error) {
            return error as string
        }
    }

    async changePassword(hostData: { email: string; currentPassword: string; newPassword: string }): Promise<string> {
        try {
            console.log("heeeee", hostData)
            const findHost = await Host.findOne({ email: hostData.email })
            if (!findHost) {
                return "No Host"
            }
            const checkPassword = await bcrypt.compare(hostData.currentPassword, findHost.password)
            if (checkPassword) {
                const samePassword = await bcrypt.compare(hostData.newPassword, findHost.password)
                if (samePassword) {
                    return "New Password Cannot be Same as Current Password"
                } else {
                    const hashedPassword = await bcrypt.hash(hostData.newPassword, 10);
                    await Host.updateOne(
                        { email: hostData.email },
                        {
                            $set:
                                { password: hashedPassword }
                        }
                    )
                    return "Password Changed"
                }
            } else {
                return "Current Password does not match"
            }
        } catch (error) {
            return error as string
        }
    }

    async editProfile(hostData: { email: string, name: string, mobile: string }): Promise<string> {
        try {
            console.log("HOstData", hostData)
            const updatingHostDetails = await Host.updateOne(
                { email: hostData.email },
                {
                    $set: {
                        name: hostData.name,
                        mobile: hostData.mobile
                    }
                }
            )
            if (updatingHostDetails.matchedCount == 1) {
                return "Host details updated"
            } else {
                return "Not updated"
            }
        } catch (error) {
            return error as string
        }
    }

    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string> {
        try {
            console.log(id, amount, 'amount')
            await Wallet.findOneAndUpdate(
                { userOrHostId: id },
                {
                    $inc: { balance: parseFloat(amount) },
                    $push: {
                        transactionHistory: {
                            type: "deposit",
                            amount: parseFloat(amount),
                            date: new Date(),
                            description: "Wallet deposit",
                        },
                    },
                }
            );
            const userWallet = await Wallet.findOne({ userOrHostId: id });
            if (!userWallet) {
                return "Wallet not found"
            }
            return { message: "Deposited", userWallet };
        } catch (error) {
            return error as string
        }
    }

    async walletWithDraw({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string> {
        try {
            console.log(id, amount, 'amount')
            await Wallet.findOneAndUpdate(
                { userOrHostId: id },
                {
                    $inc: { balance: -parseFloat(amount) },
                    $push: {
                        transactionHistory: {
                            type: "withdraw",
                            amount: parseFloat(amount),
                            date: new Date(),
                            description: "Wallet withdrawal",
                        },
                    },
                }
            );
            const userWallet = await Wallet.findOne({ userOrHostId: id });
            if (!userWallet) {
                return "Wallet not found"
            }
            return { message: "Withdrawn", userWallet };
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

    async getAdmin(): Promise<IUser | string | null> {
        try {
            const admin = await User.findOne({isAdmin:true})
            return admin;
        } catch (error) {
            return error as string
        }
    }
}

export default hostRepository