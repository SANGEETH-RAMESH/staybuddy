import { Request, Response } from "express";

import { IChatService } from "../interface/chat/IChatService";
import mongoose, { Types } from "mongoose";
import { StatusCode } from "../status/statusCode";
const ObjectId = mongoose.Types.ObjectId;

class chatController {
    constructor(private chatService: IChatService) { }

    async createChat(req: Request, res: Response): Promise<void> {
        try {
            const { ownerId } = req.body;

            const user = req.user;
            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "User ID is missing" });
                return;
            }

            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            console.log(ownerId, id, "Heeeellolo")
            const chat = await this.chatService.createChat(id, ownerId);

            res.status(StatusCode.OK).json({ success: true, chat });
        } catch (error) {
            console.error(error);
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getChat(req: Request, res: Response): Promise<void> { 
        try {
            const user = req.user;
            console.log(user)
            console.log(req.query, 's')
            const ownerId = req.query.id as string;

            if (!user || !user._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "User ID is missing" });
                return;
            }
            const userId = new ObjectId(user._id);
            const ownerObjectId = new ObjectId(ownerId);
            console.log(ownerObjectId, userId, "Validated ObjectIds");

            const response = await this.chatService.getChat(userId, ownerObjectId);
            console.log("Response", response)
            res.status(StatusCode.OK).json({ success: true, data: response });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async getHostChat(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            console.log(host, 'Host')
            if (!host || !host._id) {
                res.status(StatusCode.BAD_REQUEST).json({ success: false, message: "Host Id is missing" })
                return
            }

            const hostId = host?._id.toString()
            const response = await this.chatService.getHostChat(hostId)
            res.status(StatusCode.OK).json({ success: true, data: response })

        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }

    async createHostChat(req: Request, res: Response): Promise<void> {
        try {
            const host = req.customHost;
            console.log(host, 'HostId')
            if (!host) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "No host" });
                return;
            }
            const userId = req.body.userId
            const hostId = host?._id.toString();
            if (!hostId || !userId) {
                res.status(StatusCode.BAD_REQUEST).json({ message: "Missing hostId or userId" });
                return;
            }
            const response = await this.chatService.createHostChat(hostId, userId)
            res.status(StatusCode.OK).json({ message: response })
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({message:error})
        }
    }
}


export default chatController