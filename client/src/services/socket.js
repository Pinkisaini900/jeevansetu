import { io } from 'socket.io-client';

// Same-origin connection: Vite proxies /socket.io to the Express server.
export const socket = io({ transports: ['websocket', 'polling'] });
