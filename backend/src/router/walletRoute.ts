import { Router } from 'express';
import WalletRepository from '../respository/walletRepository';
import WalletService from '../service/walletService';
import WalletController from '../controller/walletController';
import userOrHostAuth from '../middleware/userOrHostAuth';

const wallet_route = Router();

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);

wallet_route.post('/deposit',userOrHostAuth,walletController.walletDeposit.bind(walletController))
wallet_route.get('/',userOrHostAuth,walletController.getWalletDetails.bind(walletController))
wallet_route.post('/withdraw',userOrHostAuth,walletController.walletWithdraw.bind(walletController))


export default wallet_route; 