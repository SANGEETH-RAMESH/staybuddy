import { IHostService } from "../interface/host/!HostService";
import { IHostRepository } from "../interface/host/!HostRepository";
import { sendOtp } from "../utils/mail";
import Host, { IHost } from "../model/hostModel";
// import uploadImage from "../cloudinary/cloudinary";
import { IHostel } from "../model/hostelModel";
import { Types } from "mongoose";
import HashedPassword from "../utils/hashedPassword";
import { hostPayload } from "../types/commonInterfaces/tokenInterface";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../Jwt/jwt";
type HostType = InstanceType<typeof Host>
import { ObjectId } from 'mongodb'
import { ICategory } from "../model/categoryModel";

function otpgenerator() {
    return Math.floor(1000 + Math.random() * 9000);
}

function generateRandomPassword() {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let password = '';

    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    const allCharacters = lowerCase + upperCase + numbers;
    for (let i = 0; i < 5; i++) {
        password += allCharacters[Math.floor(Math.random() * allCharacters.length)];
    }

    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

function generateRandomMobileNumber() {
    const firstDigit = Math.floor(Math.random() * 5) + 6; // First digit greater than 5 (6-9)
    let mobileNumber = firstDigit.toString();

    // Generate remaining 9 digits
    for (let i = 0; i < 9; i++) {
        mobileNumber += Math.floor(Math.random() * 10).toString();
    }

    return mobileNumber;
}

interface hostData {
    name: string,
    mobile: number,
    email: string,
    password: string
}

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
    photo: string[]
}


interface otpData {
    email: string,
    otp: number
}


// interface HostData {
//     displayName?: string;
//     email?: string;
// }

class hostService implements IHostService {
    constructor(private hostRepository: IHostRepository) { }

    async SignUp(hostData: hostData): Promise<string> {
        try {
            const existingUser = await this.hostRepository.FindHostByEmail(hostData.email)
            if (existingUser) {
                return 'existing'
            }
            const Otp = otpgenerator();
            sendOtp(hostData.email, Otp);
            await this.hostRepository.OtpGenerating(hostData.email, Otp)
            await this.hostRepository.tempStoreHost(hostData);
            return 'Otp success'


        } catch (error) {
            console.log(error)
            return error as string;
        }
    }

    async resendOtp(hostData: hostData): Promise<string | null> {
        try {
            const Otp = otpgenerator();
            sendOtp(hostData.email, Otp);
            await this.hostRepository.OtpGenerating(hostData.email, Otp);
            await this.hostRepository.tempStoreHost(hostData);
            return 'otp success'
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async verifyOtp(hostOtp: otpData): Promise<string> {
        try {
            const checkOtp = await this.hostRepository.otpChecking(hostOtp);
            if (checkOtp == 'not verified') {
                return 'Invalid otp'
            }
            const creatingHost = await this.hostRepository.CreateHost({ email: hostOtp.email })
            if (creatingHost == 'success') {
                await this.hostRepository.createWallet(hostOtp?.email)
            }
            return creatingHost;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async forgotPassword(hostData: { email: string }): Promise<HostType | null> {
        try {
            const hostFind = await this.hostRepository.FindHostByEmail(hostData.email);
            if (hostFind == null) {
                return null
            }
            const Otp = otpgenerator();
            sendOtp(hostData.email, Otp)
            await this.hostRepository.OtpGenerating(hostData.email, Otp);
            return hostFind as HostType;
        } catch (error) {
            console.log(error)
            return null;
        }
    }

    async resetPassword(hostData: { email: string, password: string }): Promise<{ message: string }> {
        try {
            const changePassword = await this.hostRepository.ChangePassword(hostData);
            return changePassword;
        } catch (error) {
            console.log(error);
            return { message: "Internal error" }
        }
    }

    async verifyLogin(hostData: hostData): Promise<{ message: string, accessToken?: string, refreshToken?: string }> {
        try {
            const checkingHost = await this.hostRepository.verifyLogin(hostData);
            return checkingHost
        } catch (error) {
            console.log(error)
            return { message: "Internal error" }
        }
    }

    async addHostel(hostData: HostelData): Promise<string> {
        try {
            // console.log(hostData,'service')

            const response = await this.hostRepository.addHostel(hostData)

            console.log(response, 'service')
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async getHostels(email: string): Promise<IHostel[] | string> {
        try {
            const getHost = await this.hostRepository.FindHostByEmail(email);
            if (!getHost) {
                return "Not host"
            }
            const hostId = getHost._id as ObjectId;
            const response = await this.hostRepository.getHostels(hostId);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async newHost(host_id: Types.ObjectId): Promise<string> {
        try {
            const getHostels = await this.hostRepository.getAllHostels();

            if (!Array.isArray(getHostels)) {
                return "Failed to fetch Hostels"
            }

            host_id = new Types.ObjectId(host_id)

            const response = await this.hostRepository.newHost({ hostels: getHostels, host_id });
            return response
        } catch (error) {
            return error as string
        }
    }

    async approvalRequest(host_id: Types.ObjectId, photo: string | undefined, documentType: string): Promise<string> {
        try {
            const uploadDocument = await this.hostRepository.uploadDocument(host_id, photo, documentType)
            if (uploadDocument == 'Documnent Updated') {
                const response = await this.hostRepository.approvalRequest(host_id);
                return response
            }
            return uploadDocument
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getOneHostel(id: Types.ObjectId): Promise<IHostel | string> {
        try {
            // console.log(req.query.id);
            const response = await this.hostRepository.getOneHostel(id)
            return response;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async hostGoogleSignUp(hostData: hostData): Promise<{ message: string; accessToken: string; refreshToken: string } | string> {
        try {
            console.log(hostData, 'hostdata')
            const password = generateRandomPassword();
            const mobile = generateRandomMobileNumber();
            const hashed = await HashedPassword.hashPassword(password);
            const data = { ...hostData, name: hostData.name, password: hashed, mobile };
            const response = await this.hostRepository.addGoogleHost(data);

            if (typeof response === 'object' && response !== null && 'message' in response) {
                if (response.message === 'Success') {
                    const hostPayload: hostPayload = {
                        _id: response.host?._id as Types.ObjectId,
                        name: response.host?.name ?? '',
                        email: response.host?.email ?? '',
                        mobile: String(response.host?.mobile ?? '')
                    }
                    const accessToken = generateAccessToken(hostPayload);
                    const refreshToken = generateAccessToken(hostPayload);
                    return { message: response.message, accessToken, refreshToken }
                } else if (response.message == 'Already') {
                    const hostPayload: hostPayload = {
                        _id: response.host?._id as Types.ObjectId,
                        name: response.host?.name ?? '',
                        email: response.host?.email ?? '',
                        mobile: String(response.host?.mobile ?? '')
                    }
                    const accessToken = generateAccessToken(hostPayload);
                    const refreshToken = generateRefreshToken(hostPayload);
                    return { message: 'Success', accessToken, refreshToken }
                }
            }
            return response as string
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getHost(id: Types.ObjectId): Promise<IHost | string> {
        try {
            const response = await this.hostRepository.findHostById(id);
            return response
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async validateRefreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | string> {
        try {
            // console.log(refreshToken,'refresh')
            const decoded = verifyToken(refreshToken)
            // console.log(decoded,'dedoddjfsd')
            if (decoded == null) {
                console.log("Token is expired")
            }

            if (typeof decoded == 'object' && decoded !== null && 'email' in decoded) {
                const response = await this.hostRepository.FindHostByEmail(decoded.email)

                if (!response) {
                    return "No Host"
                }

                const hostPayload: hostPayload = {
                    _id: response._id as Types.ObjectId,
                    name: response.name,
                    email: response.email,
                    mobile: response.mobile.toString()
                }

                const accessToken = generateAccessToken(hostPayload);
                const newRefreshToken = generateRefreshToken(hostPayload)

                return { accessToken, refreshToken: newRefreshToken }
            }
            return "Invalid token"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getAllCategory(): Promise<ICategory[] | string> {
        try {
            const response = await this.hostRepository.getAllCategory();
            return response
        } catch (error) {
            return error as string
        }
    }
}

export default hostService