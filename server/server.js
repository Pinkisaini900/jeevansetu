import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';

import { createApp } from './src/app.js';
import { initSocket } from './src/socket/index.js';

const app = createApp();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
  },
});

initSocket(io);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`JeevanSetu API on :${PORT}`);
});