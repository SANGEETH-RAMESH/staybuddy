import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
});

const uploadImage = (imageBuffering: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'profiles' }, (error, result) => {
            if (error) {
                return reject(new Error('Failed to upload image'));
            }
            if (!result) {
                return reject(new Error('Result is undefined')); 
            }
            resolve(result.secure_url);
        }).end(imageBuffering);
    });
};

export default uploadImage;