import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: true } });

  io.on('connection', (socket) => {
    // Patient / ambulance screens subscribe to one emergency.
    socket.on('join:emergency', (id) => {
      if (typeof id === 'string' && id.length < 40) socket.join(`emergency:${id}`);
    });
    // Hospital dashboards prove who they are with their login token.
    socket.on('join:hospital', (token) => {
      try {
        socket.join(`hospital:${verifyToken(token).hospitalId}`);
      } catch {
        socket.emit('auth:error');
      }
    });
  });
  return io;
}

export const emitToEmergency = (id, event, payload) => io?.to(`emergency:${id}`).emit(event, payload);
export const emitToHospital = (id, event, payload) => io?.to(`hospital:${id}`).emit(event, payload);
