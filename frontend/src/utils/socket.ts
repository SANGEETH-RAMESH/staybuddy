import { io, Socket } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_BACKEND_URL;  

const baseUrl = apiUrl.endsWith('/api') 
  ? apiUrl.slice(0, -4) 
  : apiUrl;

console.log(baseUrl, 'Base URL without /api');

export const socket: Socket = io(baseUrl);
