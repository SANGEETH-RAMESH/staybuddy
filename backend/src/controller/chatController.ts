import { Request,Response } from "express";

import { IChatService } from "../interface/chat/IChatService";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;

class chatController{
    constructor(private chatService:IChatService){}

    async createChat(req:Request,res:Response):Promise<void>{
        try {
            const { ownerId } = req.body;
            
            const user = req.user;
            // console.log(user, "user")
            if (!user || !user._id) {
                res.status(400).json({ success: false, message: "User ID is missing" });
                return;
            }

            const id = typeof user._id === "string" ? new ObjectId(user._id) : user._id;
            console.log(ownerId,id,"Heeeellolo")
            const chat = await this.chatService.createChat(id, ownerId);

            res.status(201).json({ success: true, chat });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }

    async getChat(req:Request,res:Response):Promise<void>{
        try {
            const user = req.user;
        const ownerId = req.query.id as string; // Ensure ownerId is a string

        if (!user || !user._id) {
            res.status(400).json({ success: false, message: "User ID is missing" });
            return;
        }

        // Convert user._id to ObjectId
        const userId = new ObjectId(user._id);

        // Convert ownerId to ObjectId safely
        if (!ownerId || typeof ownerId !== "string" || !ObjectId.isValid(ownerId)) {
            res.status(400).json({ success: false, message: "Invalid owner ID" });
            return;
        }

        const ownerObjectId = new ObjectId(ownerId);
        console.log(ownerObjectId, userId, "Validated ObjectIds");

        // Call the service with valid ObjectIds
        const response = await this.chatService.getChat(userId, ownerObjectId);
        console.log("Response",response)
        res.status(200).json({ success: true, data: response });
        } catch (error) {
            console.log(error)
        }
    }
}


export default chatController