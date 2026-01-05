import { IWalletResponse } from "../dtos/WalletResponse";
import { IWalletRepository } from "../interface/wallet/!WalletRepository";
import { IWalletService } from "../interface/wallet/!WalletService";



class WalletService implements IWalletService {
    constructor(private _walletRepository: IWalletRepository) { }


    async walletDeposit({ id, amount, }: { id: string; amount: string; }): Promise<{ message: string; userWallet: IWalletResponse } | string> {
        try {
            const response = await this._walletRepository.walletDeposit({ id, amount })
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async walletWithdraw({ id, amount }: { id: string, amount: string }): Promise<string> {
        try {
            const response = await this._walletRepository.walletWithdraw({ id, amount })
            return response
        } catch (error) {
            console.log(error)
            return error as string
        }
    }

    async getWalletDetails(id: string): Promise<IWalletResponse | string | null> {
        try {
            const response = await this._walletRepository.findUserWallet(id)
            return response
        } catch (error) {
            return error as string
        }
    }
}

export default WalletService