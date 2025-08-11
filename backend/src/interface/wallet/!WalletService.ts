import { IWalletResponse } from "../../dtos/WalletResponse";



export interface IWalletService {
    getWalletDetails(id: string): Promise<IWalletResponse | string | null>,
    walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWalletResponse } | string>,
    walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string>,
}