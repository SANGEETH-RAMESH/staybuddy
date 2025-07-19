import mongoose, { Types } from "mongoose";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import User, { IUser } from "../model/userModel";
import Wallet, { IWallet } from "../model/walletModel";
import baseRepository from "./baseRespository";




class walletRepository extends baseRepository<IWallet> implements IWalletRepository {
    constructor() {
        super(Wallet)
    }

    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string> {
        try {
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
            console.log(error);
            return error as string;
        }
    }


    async walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string> {
        try {
            await Wallet.findOneAndUpdate(
                { userOrHostId: id },
                {
                    $inc: { balance: -parseFloat(amount) },
                    $push: {
                        transactionHistory: {
                            type: "withdraw",
                            amount: amount,
                            date: new Date(),
                            description: "Wallet withdraw"
                        }
                    }
                }
            )
            return "Withdrawn"
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async createWallet(email: string): Promise<string> {
        try {
            const findUser = await User.findOne({ email });
            if (!findUser) {
                return "User not found"
            }
            const creatingWallet = new Wallet({
                userOrHostId: findUser._id
            })
            await creatingWallet.save();
            findUser.wallet_id = creatingWallet._id as mongoose.Types.ObjectId;
            findUser.tempExpires = undefined;
            findUser.temp = false;
            await findUser.save();
            return "success"
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async findUserWallet(id: string): Promise<IWallet | string | null> {
        try {
            const userWallet = await Wallet.aggregate([
                { $match: { userOrHostId: new Types.ObjectId(id) } },
                {
                    $addFields: {
                        transactionHistory: {
                            $sortArray: { input: "$transactionHistory", sortBy: { date: -1 } }
                        }
                    }
                }
            ]);
            if (!userWallet) {
                return "No Wallet"
            }
            return userWallet[0]
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

}

export default walletRepository