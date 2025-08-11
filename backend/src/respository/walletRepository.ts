import mongoose, { Types } from "mongoose";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import User from "../model/userModel";
import Wallet , {IWallet}  from "../model/walletModel";
import baseRepository from "./baseRespository";
import { Messages } from "../messages/messages";
import Order from "../model/orderModel";
import { IWalletResponse } from "../dtos/WalletResponse";




class walletRepository extends baseRepository<IWallet> implements IWalletRepository {
    constructor() {
        super(Wallet)
    }

    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWalletResponse } | string> {
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
            const userWallet = await Wallet.findOne({ userOrHostId: id }) as IWalletResponse;
            if (!userWallet) {
                return Messages.WalletNotFound;
            }
            return { message: Messages.Deposited, userWallet };
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
            return Messages.Withdrawn;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async createWallet(email: string): Promise<string> {
        try {
            const findUser = await User.findOne({ email });
            if (!findUser) {
                return Messages.UserNotFound;
            }
            const creatingWallet = new Wallet({
                userOrHostId: findUser._id
            })
            await creatingWallet.save();
            findUser.wallet_id = creatingWallet._id as mongoose.Types.ObjectId;
            findUser.tempExpires = undefined;
            findUser.temp = false;
            await findUser.save();
            return Messages.success;
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async findUserWallet(id: string): Promise<IWalletResponse | string | null> {
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
                return Messages.NoWallet;
            }
            return userWallet[0]
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async creditHostWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: amount },
                    $push: {
                        transactionHistory: {
                            type: "deposit",
                            amount: amount,
                            date: new Date(),
                            description: `Credited ${amount} to wallet`
                        }
                    }
                });

            return Messages.WalletUpdatedSuccessfully;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async debitUserWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: -amount },
                    $push: {
                        transactionHistory: {
                            type: "withdrawal",
                            amount: amount,
                            date: new Date(),
                            description: `Debited ${amount} from wallet`
                        }
                    }
                });

            return Messages.WalletUpdatedSuccessfully;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async creditUserWallet(id: Types.ObjectId, orderId: Types.ObjectId, cancellationStatus: string): Promise<string> {
        try {
            let amount = 0;
            const result = await Order.findOne({ _id: orderId })

            if (cancellationStatus == 'available' && result) {
                const foodRate = result.foodRate ?? 0;
                amount = (result.totalDepositAmount ?? 0) + (result.totalRentAmount ?? 0) + foodRate;
            } else {
                amount = result?.totalDepositAmount ?? 0;
            }
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: amount },
                    $push: {
                        transactionHistory: {
                            type: "deposit",
                            amount: amount,
                            date: new Date(),
                            description: `Credited ${amount} to wallet`
                        }
                    }
                });

            return Messages.WalletUpdatedSuccessfully;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

    async debitHostWallet(id: Types.ObjectId, amount: number): Promise<string> {
        try {
            await Wallet.updateOne(
                { userOrHostId: id },
                {
                    $inc: { balance: -amount },
                    $push: {
                        transactionHistory: {
                            type: "withdraw",
                            amount: amount,
                            date: new Date(),
                            description: `Debited ${amount} from wallet`
                        }
                    }
                });

            return Messages.WalletUpdatedSuccessfully;
        } catch (error) {
            console.log(error);
            return error as string
        }
    }

}

export default walletRepository