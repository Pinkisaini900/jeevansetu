import { z } from 'zod';
import { parse, send, wrap } from '../middleware/errors.js';
import { EMERGENCY_TYPES } from '../services/matching.js';
import * as svc from '../services/emergencyService.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const createSchema = z.object({
  ambulanceId: z.union([z.string().trim().min(1).max(30), z.number()]),
  emergencyType: z.enum(EMERGENCY_TYPES),
  patientName: z.string().trim().min(1, 'is required').max(80),
  patientAge: z.coerce.number().int().min(0).max(120),
  patientGender: z.enum(['Male', 'Female', 'Other']),
  description: z.string().trim().min(3, 'needs a short description').max(500),
  bloodGroup: z.enum(BLOOD_GROUPS).optional().or(z.literal('')).or(z.null()),
});

const nearbySchema = z.object({
  emergencyId: z.string().max(40).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  type: z.enum(EMERGENCY_TYPES).optional(),
});

const requestSchema = z.object({ hospitalIds: z.array(z.coerce.number().int().positive()).min(1).max(5) });
const selectSchema = z.object({ hospitalId: z.coerce.number().int().positive() });

export const create = wrap(async (req, res) => {
  const em = await svc.createEmergency(parse(createSchema, req.body));
  send(res, { id: em.id, status: em.status }, 201);
});

export const nearby = wrap(async (req, res) => send(res, await svc.nearbyHospitals(parse(nearbySchema, req.query))));
export const status = wrap(async (req, res) => send(res, await svc.getStatus(req.params.id)));

export const requestHospitals = wrap(async (req, res) => {
  const { hospitalIds } = parse(requestSchema, req.body);
  send(res, await svc.sendRequests(req.params.id, hospitalIds), 201);
});

export const selectHospital = wrap(async (req, res) => {
  const { hospitalId } = parse(selectSchema, req.body);
  send(res, await svc.selectHospital(req.params.id, hospitalId));
});

export const simulateResponses = wrap(async (req, res) => send(res, await svc.simulateResponses(req.params.id)));
export const simulateMovement = wrap(async (req, res) => send(res, await svc.startMovement(req.params.id)));
export const stats = wrap(async (_req, res) => send(res, await svc.getStats()));
