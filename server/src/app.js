import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50kb' }));
  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
