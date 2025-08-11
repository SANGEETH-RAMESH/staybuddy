import { Types } from "mongoose";
import { IWalletResponse } from "../../dtos/WalletResponse";



export interface IWalletRepository {
    createWallet(email: string): Promise<string>,
    walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWalletResponse } | string>,
    walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string>,
    findUserWallet(id: string): Promise<IWalletResponse | string | null>,
    creditHostWallet(id: Types.ObjectId, amount: number): Promise<string>,
    debitUserWallet(id: Types.ObjectId, amount: number): Promise<string>,
    creditUserWallet(id: Types.ObjectId, orderId: Types.ObjectId, cancellationPolicy: string): Promise<string>,
    debitHostWallet(id: Types.ObjectId, amount: number): Promise<string>,


}