import { Request, Response } from "express";
import { IUserService } from "../interface/user/!UserService";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

// Custom Request interface to include user
// export interface CustomRequest extends Request {
//     user?: {
//         email: string;
//         _id: string | Types.ObjectId;  // Allow _id to be a string or ObjectId
//     };
// }

// interface User {
//     email: string;
//     _id: string | Types.ObjectId;
// }

// // Extend the Express Request type
// interface CustomRequest extends Request {
//     user?: User;
// }


class UserController {
    constructor(private userService: IUserService) { }

    // User SignUp
    async userSignUp(req: Request, res: Response): Promise<void> {
        try {
            // console.log(req.body)
            // const { userData } = req.body;
            const response = await this.userService.userSignUp(req.body);
            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in userSignUp:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Verify OTP
    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.verifyOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in verifyOtp:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Verify Login
    async verifyLogin(req: Request, res: Response): Promise<void> {
        try {
            console.log("heee")
            const response = await this.userService.verifyLogin(req.body);
            console.log("REsponse", response)
            // Check if response is an object before accessing its properties
            if (typeof response === 'object' && response !== null) {
                if (response.message === "Success") {
                    res.status(200).json({
                        success: true,
                        message: response.message,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                    });
                } else if (response.message === "user is blocked") {
                    res.status(200).json({ success: false, message: response.message });
                } else {
                    res.status(200).json({ success: false, data: response });
                }
            } else {
                // If response is a string, handle accordingly
                res.status(200).json({ success: false, message: response });
            }
        } catch (error) {
            console.error("Error in verifyLogin:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Resend OTP
    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.resendOtp(req.body);
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in resendOtp:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Forgot Password
    async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            console.log('hi')
            const existingUser = await this.userService.forgotPassword(req.body);
            if (existingUser && existingUser.temp === false) {
                res.json({ success: true, message: "User found" });
            } else {
                res.json({ success: false, message: "User not found" });
            }
        } catch (error) {
            console.error("Error in forgotPassword:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Verify Forgot Password OTP
    async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.verifyOtp(req.body);
            console.log(response, "sfdsdf")
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in verifyForgotPasswordOtp:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Reset Password
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            // console.log('key',req.body)
            // const {email} = req.body
            const response = await this.userService.resetPassword(req.body);
            // console.log("response",response)
            res.json({ success: true, message: response });
        } catch (error) {
            console.error("Error in resetPassword:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async getUserDetails(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            // console.log(user, "user")
            if (!user || !user._id) {
                res.status(400).json({ success: false, message: "User ID is missing" });
                return;
            }

            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            // console.log(id, 'iddd');

            const response = await this.userService.getUserDetails(id);
            // console.log(response,'response')

            if (!response) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            // console.log(response,'response')
            res.status(200).json({ success: true, data: response });
        } catch (error) {
            console.error("Error in getUserDetails:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Change Password
    async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            // console.log(user, "user")
            if (!user || !user.email) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }
            // console.log(user.email, 'eimail')
            const data = { ...req.body, email: user.email };
            const response = await this.userService.changePassword(data);
            console.log("Data", data)
            if (!response) {
                res.status(400).json({ success: false, message: "Password change failed" });
                return;
            }

            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in changePassword:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    // Edit User Details
    async editUserDetail(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            // console.log(user, "user")
            if (!user || !user.email) {
                res.status(401).json({ success: false, message: "Unauthorized" });
                return;
            }

            const data = { ...req.body, email: user.email };
            const response = await this.userService.editUserDetail(data);

            if (!response) {
                res.status(400).json({ success: false, message: "Failed to update user details" });
                return;
            }

            res.status(200).json({ success: true, message: response });
        } catch (error) {
            console.error("Error in editUserDetail:", error);
            res.status(500).json({ success: false, message: "Internal server error" });
        }
    }

    async googleSignUp(req: Request, res: Response): Promise<void> {
        try {

            const user = req.user
            const userData = { name: user?.displayName, email: user?.email };
            const response = await this.userService.googleSignUp(userData)
            // console.log(response)
            if (typeof response !== 'string' && response?.message === 'Success') {
                // console.log(response,'heeeee')
                res.redirect(`http://localhost:5173/user/home/?accessToken=${response.accessToken}&refreshToken=${response.refreshToken}`)
            } else {
                // Handle failure case
                res.json({ message: response });
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getHostels(req: Request, res: Response): Promise<void> {
        try {
            // console.log('hello')
            console.log(req.query, 'sdfsf')
            const { page, limit,search } = req.query
            const pageStr = typeof page === 'string' ? page : '1';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const searchStr = typeof search === 'string' ? search : '';
            const response = await this.userService.getHostels(pageStr, limitStr,searchStr);
            res.status(200).json({ success: true, response })
        } catch (error) {
            console.log(error)
        }
    }

    async getSingleHostel(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const id = new ObjectId(userId)
            const response = await this.userService.getSingleHostel(id);
            console.log(response)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async validaterefreshToken(req: Request, res: Response): Promise<void> {
        try {
            // console.log("he",req.body)
            const { refreshToken } = req.body
            const response = await this.userService.validateRefreshToken(refreshToken)
            // console.log(response)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: "Error occured" })
        }
    }

    // async hostelBookings(req:Request,res:Response):Promise<void>{
    //     try {
    //         console.log(req.body,"body")
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    async getWalletDetails(req: Request, res: Response): Promise<void> {
        try {
            console.log('jjj', req.user)
            if (!req.user) {
                res.status(400).json({ message: "No user" })
            }
            const userId = (req.user as { _id: string })._id;
            const response = await this.userService.getWalletDetails(userId);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async walletDeposit(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body, req.user)
            const { amount } = req.body;
            // const {_id} = req.user
            if (!req.user) {
                res.status(400).json({ message: "No User" })
            }
            const data = { id: req?.user?._id as string, amount: String(amount) };
            const response = await this.userService.walletDeposit(data)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async walletWithdraw(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            if (!req.user) {
                res.status(400).json({ message: "No User" })
            }
            const data = { id: req?.user?._id as string, amount: String(amount) }
            const response = await this.userService.walletWithdraw(data)
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async getSavedBookings(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.query,'Query')
            console.log(req.params, 'dsfsd')
            const { page, limit } = req.query
            const pageStr = typeof page === 'string' ? page : '1';
            const limitStr = typeof limit === 'string' ? limit : '10';
            const id = req.params.id;
            const userId = new ObjectId(id)
            const response = await this.userService.getSavedBookings(userId,pageStr, limitStr);
            res.status(200).json({ success: true, message: response })
        } catch (error) {
            console.log(error)
        }
    }

    async addToWishlist(req: Request, res: Response): Promise<void> {
        try {
            const hostelId = req.params.id
            if (req.user) {
                const userId = req.user._id
                const response = await this.userService.addToWishlist(hostelId, userId)
                res.status(200).json({ message: response })
            }

        } catch (error) {
            console.log(error)
            res.status(400).json({ message: error })
        }
    }

    async removeFromWishlist(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.params.id, "delete")
            const hostelId = req.params.id;
            const userId = req.user?._id
            if (userId) {
                const response = await this.userService.removeFromWishlist(hostelId, userId)
                res.status(200).json({ message: response })
            }
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async checkWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id;
            const hostelId = req.params.id;
            if (userId) {
                const response = await this.userService.checkWishlist(userId, hostelId)
                res.status(200).json({ message: response })
            }
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async getWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this.userService.getWishlist(userId)
                res.status(200).json({ message: response })
            }
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }

    async deleteWishlist(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user?._id
            if (userId) {
                const response = await this.userService.deleteWishlist(userId)
                res.status(200).json({ message: response })
            }
        } catch (error) {
            res.status(200).json({ message: error })
        }
    }

    async getHost(req: Request, res: Response): Promise<void> {
        try {
            const response = await this.userService.allHost();
            res.status(200).json({ message: response })
        } catch (error) {
            res.status(500).json({ message: error })
        }
    }
}

export default UserController;
