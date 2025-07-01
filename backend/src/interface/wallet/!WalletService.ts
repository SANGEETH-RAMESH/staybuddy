import { IWallet } from "../../model/walletModel";


export interface IWalletService {
    getWalletDetails(id: string): Promise<IWallet | string | null>,
    walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string>,
    walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string>,
}