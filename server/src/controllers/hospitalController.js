import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError, parse, send, wrap } from '../middleware/errors.js';
import { signHospitalToken } from '../middleware/auth.js';
import * as svc from '../services/emergencyService.js';

const loginSchema = z.object({ username: z.string().trim().min(1).max(50), password: z.string().min(1).max(100) });
const prepSchema = z.object({ status: z.enum(['PREPARING', 'READY']) });
const idParam = (req) => parse(z.coerce.number().int().positive(), req.params.id);

export const login = wrap(async (req, res) => {
  const { username, password } = parse(loginSchema, req.body);
  const hospital = await prisma.hospital.findUnique({ where: { username } });
  const valid = hospital && (await bcrypt.compare(password, hospital.password));
  if (!valid) throw new HttpError(401, 'Invalid username or password.');
  send(res, {
    token: signHospitalToken(hospital.id),
    hospital: { id: hospital.id, name: hospital.name, address: hospital.address, contactName: hospital.contactName },
  });
});

export const requests = wrap(async (req, res) => send(res, await svc.hospitalRequests(req.hospitalId)));

export const accept = wrap(async (req, res) => {
  await svc.respond(idParam(req), 'ACCEPTED', req.hospitalId);
  send(res, { status: 'ACCEPTED' });
});

export const decline = wrap(async (req, res) => {
  await svc.respond(idParam(req), 'DECLINED', req.hospitalId);
  send(res, { status: 'DECLINED' });
});

export const prepare = wrap(async (req, res) => {
  const { status } = parse(prepSchema, req.body);
  await svc.setPreparation(idParam(req), req.hospitalId, status);
  send(res, { prepStatus: status });
});
