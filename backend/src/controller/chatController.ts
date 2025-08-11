import { Request, Response } from "express";

import { IChatService } from "../interface/chat/IChatService";
import mongoose, { Types } from "mongoose";
import { StatusCode } from "../status/statusCode";
import { Messages } from "../messages/messages";
const ObjectId = mongoose.Types.ObjectId;

class chatController {
    constructor(private _chatService: IChatService) { }

    async createChat(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId } = req.body;

            const user = req.user;
            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.UserIdMissing });
                return;
            }

            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            const chat = await this._chatService.createChat(id, ownerId);

            res.status(StatusCode.OK).json({ success: true, chat });
        } catch (error) {
            console.error(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getChat(req: Request, res: Response): Promise<void> {
        try {
            const user = req.user;
            const ownerId = req.query.id as string;

            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.UserIdMissing });
                return;
            }
            const userId = new ObjectId(user._id);
            const ownerObjectId = new ObjectId(ownerId);

            const response = await this._chatService.getChat(userId, ownerObjectId);
            res.status(StatusCode.OK).json({ success: true, data: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async getHostChat(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host || !host._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: Messages.HostIdMissing })
                return
            }

            const hostId = host?._id.toString()
            const response = await this._chatService.getHostChat(hostId)
            res.status(StatusCode.OK).json({ success: true, data: response })

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }

    async createHostChat(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            if (!host) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.NoHost });
                return;
            }
            const userId = req.body.userId
            const hostId = host?._id.toString();
            if (!hostId || !userId) {
                res.status(StatusCode.BAD_REQUEST).json({ message: Messages.MissingUserIdOrHostId });
                return;
            }
            const response = await this._chatService.createHostChat(hostId, userId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: (error as Error).message });
        }
    }
}


export default chatController