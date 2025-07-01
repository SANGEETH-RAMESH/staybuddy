import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import { IWalletService } from "../interface/wallet/!WalletService";
import { IWallet } from "../model/walletModel";



class WalletService implements IWalletService {
    constructor(private walletRepository: IWalletRepository) { }


    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWallet } | string> {
        try {
            const response = await this.walletRepository.walletDeposit({ id, amount })
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string> {
        try {
            const response = await this.walletRepository.walletWithdraw({ id, amount })
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getWalletDetails(id: string): Promise<IWallet | string | null> {
        try {
            const response = await this.walletRepository.findUserWallet(id)
            return response
        } catch (error) {
            return error as string
        }
    }
}

export default WalletService