import { send, wrap } from '../middleware/errors.js';
import * as svc from '../services/emergencyService.js';

export const get = wrap(async (req, res) => send(res, await svc.findAmbulance(req.params.id)));
export const list = wrap(async (_req, res) => send(res, await svc.listAmbulances()));
