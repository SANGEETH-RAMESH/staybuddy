import { IWalletService } from "../interface/wallet/!WalletService";
import { Request, Response } from "express";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";


class WalletController {
    constructor(private _walletService: IWalletService) { }

    async walletDeposit(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const id = req?.customHost?._id?.toString() || req?.user?._id?.toString();
            if (!id) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoUserOrHost });
                return
            }
            const data = { id, amount: String(amount) };
            const response = await this._walletService.walletDeposit(data)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async walletWithdraw(req: Request, res: Response): Promise<void> {
        try {
            const { amount } = req.body;
            const id = req?.customHost?._id?.toString() || req?.user?._id?.toString();
            if (!id) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoUserOrHost });
                return
            }
            const data = { id, amount: String(amount) }
            const response = await this._walletService.walletWithdraw(data)
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getWalletDetails(req: Request, res: Response): Promise<void> {
        try {

            const id = req?.customHost?._id?.toString() || req?.user?._id?.toString();
            if (!id) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoUserOrHost });
                return
            }
            // const userId = (req.user as { _id: string })._id;
            const response = await this._walletService.getWalletDetails(id);
            res.status(StatusCode.OK).json({ success: true, message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

}

export default WalletController