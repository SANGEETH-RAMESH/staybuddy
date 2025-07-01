import { IWallet } from "../../model/walletModel";



export interface IWalletRepository {
    createWallet(email: string): Promise<string>,
    walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string>,
    walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string>,
    findUserWallet(id: string): Promise<IWallet | string | null>,

}