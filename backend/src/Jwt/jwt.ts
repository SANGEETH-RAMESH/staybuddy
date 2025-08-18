import jwt, { JwtPayload } from 'jsonwebtoken';
import { adminPayload, hostPayload, userPayload } from '../types/commonInterfaces/tokenInterface';
import dotenv from 'dotenv';

dotenv.config();

const secret = process.env.JWT_SECRET ?? 'default_secret_key_is_there'

if (!secret || !process.env.REFRESH_TOKEN_KEY) {
    console.warn("Using default token secrets. Update your .env file.");
}

export const generateAccessToken = (user: userPayload | hostPayload | adminPayload) => {
    return jwt.sign(user, secret, { expiresIn: '2h' });
};

export const generateRefreshToken = (user:userPayload | hostPayload | adminPayload) =>{
    return jwt.sign(user,secret,{expiresIn:'1d'})
}



export const verifyToken = (token: string): JwtPayload | string | null => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.log('Token has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            console.log('Invalid token');
        } else {
            console.log('Unexpected error', error);
        }
        return null;
    }
};
