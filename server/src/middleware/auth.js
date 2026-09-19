import jwt from 'jsonwebtoken';
import { HttpError } from './errors.js';

const secret = () => process.env.JWT_SECRET || 'jeevansetu-insecure-dev-secret';

export const signHospitalToken = (hospitalId) => jwt.sign({ hospitalId }, secret(), { expiresIn: '8h' });
export const verifyToken = (token) => jwt.verify(token, secret());

export function requireHospital(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Hospital login required.'));
  try {
    req.hospitalId = verifyToken(token).hospitalId;
    return next();
  } catch {
    return next(new HttpError(401, 'Session expired. Please log in again.'));
  }
}

export function demoOnly(_req, _res, next) {
  if (process.env.DEMO_MODE === 'false') return next(new HttpError(403, 'Demo mode is disabled on this server.'));
  return next();
}
