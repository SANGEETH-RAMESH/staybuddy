import mongoose, { Document, Schema } from 'mongoose';

export interface IHostel extends Document {
    hostelname: string;
    location: string;
    nearbyaccess: string;
    beds: number;
    policies: string;
    category: string;
    advanceamount: number;
    photos: string[];
    facilities: string[];
    bedShareRoom: number;
    foodRate?: number;
    phone: string;
    host_id: mongoose.Types.ObjectId; 
}

const hostelModel: Schema = new Schema(
    {
        hostelname: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        nearbyaccess: {
            type: String,
            required: true,
        },
        beds: {
            type: Number,
            required: true,
        },
        policies: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        advanceamount: {
            type: Number,
            required: true,
        },
        photos: {
            type: [String],
            required: true,
        },
        facilities: {
            type: [String],
            required: true,
        },
        bedShareRoom: {
            type: Number,
            required: true,
        },
        foodRate: {
            type: Number
        },
        phone: {
            type: String,
            required: true,
        },
        host_id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Host',
            required: true,
        },
        
    }
);

const Hostel = mongoose.model<IHostel>('Hostel', hostelModel);

export default Hostel;