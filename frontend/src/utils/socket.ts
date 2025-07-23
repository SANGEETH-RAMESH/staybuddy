import { io, Socket } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_BACKEND_URL;

export const socket: Socket = io(`${apiUrl}`);
