import crypto from 'crypto';
import { prisma } from '../db.js';
import { HttpError } from '../middleware/errors.js';
import { metrics } from './geo.js';
import { matchHospital, splitList } from './matching.js';
import { emitToEmergency, emitToHospital } from '../socket/index.js';

const ACTIVE = ['CREATED', 'REQUESTED', 'CONFIRMED'];
const RADIUS_KM = 25;
const sims = new Map(); // emergencyId -> { timer, ambulanceId }

const newEmergencyId = () => `JS-EM-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
const pos = (o) => ({ latitude: o.latitude, longitude: o.longitude });

/* ---------- ambulances ---------- */

export async function findAmbulance(idOrNumber) {
  const key = String(idOrNumber);
  const where = /^\d+$/.test(key) ? { id: Number(key) } : { ambulanceNumber: key };
  const ambulance = await prisma.ambulance.findUnique({ where });
  if (!ambulance) throw new HttpError(404, `Ambulance ${key} was not found.`);
  return ambulance;
}

export const listAmbulances = () => prisma.ambulance.findMany({ orderBy: { id: 'asc' } });

function stopSimsForAmbulance(ambulanceId) {
  for (const [id, sim] of sims) {
    if (sim.ambulanceId === ambulanceId) {
      clearInterval(sim.timer);
      sims.delete(id);
    }
  }
}

/* ---------- emergencies ---------- */

export async function createEmergency(data) {
  const ambulance = await findAmbulance(data.ambulanceId);
  stopSimsForAmbulance(ambulance.id);
  // Demo behaviour: every new emergency starts with the ambulance at its home position.
  await prisma.ambulance.update({
    where: { id: ambulance.id },
    data: { latitude: ambulance.homeLatitude, longitude: ambulance.homeLongitude },
  });
  return prisma.emergencyRequest.create({
    data: {
      id: newEmergencyId(),
      ambulanceId: ambulance.id,
      patientName: data.patientName,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      emergencyType: data.emergencyType,
      description: data.description,
      bloodGroup: data.bloodGroup || null,
    },
  });
}

export async function getStatus(id) {
  const em = await prisma.emergencyRequest.findUnique({
    where: { id },
    include: { ambulance: true, responses: { include: { hospital: true }, orderBy: { id: 'asc' } } },
  });
  if (!em) throw new HttpError(404, 'Emergency not found.');
  const amb = em.ambulance;

  const responses = em.responses.map((r) => ({
    id: r.id,
    hospitalId: r.hospitalId,
    hospitalName: r.hospital.name,
    address: r.hospital.address,
    latitude: r.hospital.latitude,
    longitude: r.hospital.longitude,
    status: r.status,
    prepStatus: r.prepStatus,
    requestedAt: r.createdAt,
    respondedAt: r.respondedAt,
    ...metrics(amb, r.hospital),
  }));
  const selected = responses.find((r) => r.status === 'SELECTED') || null;

  return {
    id: em.id,
    status: em.status,
    emergencyType: em.emergencyType,
    patientName: em.patientName,
    patientAge: em.patientAge,
    patientGender: em.patientGender,
    description: em.description,
    bloodGroup: em.bloodGroup,
    createdAt: em.createdAt,
    ambulance: { id: amb.id, ambulanceNumber: amb.ambulanceNumber, driverName: amb.driverName, ...pos(amb) },
    responses,
    selected,
    tracking: selected
      ? { distanceKm: selected.distanceKm, etaMinutes: selected.etaMinutes, arrived: em.status === 'ARRIVED' }
      : null,
  };
}

/** Push the fresh emergency state to the ambulance screen and nudge every involved hospital. */
async function broadcast(emergencyId) {
  const status = await getStatus(emergencyId);
  emitToEmergency(emergencyId, 'emergency:update', status);
  for (const r of status.responses) emitToHospital(r.hospitalId, 'hospital:update', { emergencyId });
  return status;
}

/* ---------- hospital discovery ---------- */

export async function nearbyHospitals({ emergencyId, lat, lng, type }) {
  let from;
  let emergencyType = type || 'OTHER';
  let existing = [];

  if (emergencyId) {
    const em = await prisma.emergencyRequest.findUnique({
      where: { id: emergencyId },
      include: { ambulance: true, responses: true },
    });
    if (!em) throw new HttpError(404, 'Emergency not found.');
    from = pos(em.ambulance);
    emergencyType = em.emergencyType;
    existing = em.responses;
  } else if (Number.isFinite(lat) && Number.isFinite(lng)) {
    from = { latitude: lat, longitude: lng };
  } else {
    throw new HttpError(400, 'Provide emergencyId, or lat and lng.');
  }

  const hospitals = await prisma.hospital.findMany();
  return hospitals
    .map((h) => {
      const match = matchHospital(h, emergencyType);
      const response = existing.find((r) => r.hospitalId === h.id);
      return {
        id: h.id,
        name: h.name,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        emergencyServices: splitList(h.emergencyServices),
        specialties: splitList(h.specialties),
        relevantSpecialties: match.relevantSpecialties,
        suitable: match.suitable,
        traumaAvailable: h.traumaAvailable, // prototype/demo data
        icuAvailable: h.icuAvailable, // prototype/demo data
        requestStatus: response?.status ?? null,
        ...metrics(from, h),
      };
    })
    .filter((h) => h.distanceKm <= RADIUS_KM)
    .sort((a, b) => Number(b.suitable) - Number(a.suitable) || a.distanceKm - b.distanceKm);
}

/* ---------- request / respond / select ---------- */

export async function sendRequests(emergencyId, hospitalIds) {
  const em = await prisma.emergencyRequest.findUnique({ where: { id: emergencyId }, include: { responses: true } });
  if (!em) throw new HttpError(404, 'Emergency not found.');
  if (!['CREATED', 'REQUESTED'].includes(em.status)) {
    throw new HttpError(409, 'A hospital is already confirmed for this emergency.');
  }

  const already = new Set(em.responses.map((r) => r.hospitalId));
  const fresh = [...new Set(hospitalIds)].filter((id) => !already.has(id));
  if (!fresh.length) throw new HttpError(409, 'Requests were already sent to these hospitals.');

  const found = await prisma.hospital.count({ where: { id: { in: fresh } } });
  if (found !== fresh.length) throw new HttpError(404, 'One or more hospitals were not found.');

  await prisma.$transaction([
    ...fresh.map((hospitalId) =>
      prisma.hospitalResponse.create({ data: { emergencyRequestId: emergencyId, hospitalId, status: 'REQUESTED' } }),
    ),
    prisma.emergencyRequest.update({ where: { id: emergencyId }, data: { status: 'REQUESTED' } }),
  ]);
  return broadcast(emergencyId);
}

/** decision: 'ACCEPTED' | 'DECLINED'. hospitalId (optional) enforces ownership for real hospital logins. */
export async function respond(responseId, decision, hospitalId = null) {
  const r = await prisma.hospitalResponse.findUnique({ where: { id: responseId } });
  if (!r || (hospitalId !== null && r.hospitalId !== hospitalId)) throw new HttpError(404, 'Request not found.');
  if (r.status === 'CLOSED') {
    throw new HttpError(409, 'This request is closed because another hospital was confirmed.');
  }
  if (r.status !== 'REQUESTED') throw new HttpError(409, `This request is already ${r.status.toLowerCase()}.`);

  await prisma.hospitalResponse.update({ where: { id: r.id }, data: { status: decision, respondedAt: new Date() } });
  return broadcast(r.emergencyRequestId);
}

export async function selectHospital(emergencyId, hospitalId) {
  const em = await prisma.emergencyRequest.findUnique({ where: { id: emergencyId }, include: { responses: true } });
  if (!em) throw new HttpError(404, 'Emergency not found.');
  if (['CONFIRMED', 'ARRIVED'].includes(em.status)) throw new HttpError(409, 'A hospital is already confirmed.');

  const chosen = em.responses.find((r) => r.hospitalId === hospitalId);
  if (!chosen || chosen.status !== 'ACCEPTED') {
    throw new HttpError(409, 'Only a hospital that has accepted the request can be selected.');
  }

  await prisma.$transaction([
    prisma.hospitalResponse.update({ where: { id: chosen.id }, data: { status: 'SELECTED' } }),
    // Every other hospital that has not declined sees the request as CLOSED.
    prisma.hospitalResponse.updateMany({
      where: { emergencyRequestId: emergencyId, id: { not: chosen.id }, status: { in: ['REQUESTED', 'ACCEPTED'] } },
      data: { status: 'CLOSED' },
    }),
    prisma.emergencyRequest.update({
      where: { id: emergencyId },
      data: { selectedHospitalId: hospitalId, status: 'CONFIRMED' },
    }),
  ]);
  return broadcast(emergencyId);
}

export async function setPreparation(responseId, hospitalId, prepStatus) {
  const r = await prisma.hospitalResponse.findUnique({ where: { id: responseId } });
  if (!r || r.hospitalId !== hospitalId) throw new HttpError(404, 'Request not found.');
  if (r.status !== 'SELECTED') throw new HttpError(409, 'Preparation can start once your hospital is confirmed.');
  await prisma.hospitalResponse.update({ where: { id: r.id }, data: { prepStatus } });
  return broadcast(r.emergencyRequestId);
}

/* ---------- hospital dashboard ---------- */

export async function hospitalRequests(hospitalId) {
  const rows = await prisma.hospitalResponse.findMany({
    where: { hospitalId },
    include: { hospital: true, emergencyRequest: { include: { ambulance: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => {
    const em = r.emergencyRequest;
    return {
      id: r.id,
      emergencyId: em.id,
      status: r.status,
      prepStatus: r.prepStatus,
      emergencyType: em.emergencyType,
      patientAge: em.patientAge,
      patientGender: em.patientGender, // patient name is intentionally not shared at this stage
      bloodGroup: em.bloodGroup,
      description: em.description,
      ambulanceNumber: em.ambulance.ambulanceNumber,
      ambulanceLocation: pos(em.ambulance),
      hospitalLocation: pos(r.hospital),
      arrived: em.status === 'ARRIVED',
      receivedAt: r.createdAt,
      respondedAt: r.respondedAt,
      ...metrics(em.ambulance, r.hospital),
    };
  });
}

/* ---------- demo mode ---------- */

const DEMO_PATTERN = ['ACCEPTED', 'DECLINED', 'ACCEPTED', 'ACCEPTED', 'DECLINED'];

/** Demo: pending hospitals answer one after another so the tracking screen visibly updates. */
export async function simulateResponses(emergencyId) {
  const pending = await prisma.hospitalResponse.findMany({
    where: { emergencyRequestId: emergencyId, status: 'REQUESTED' },
    orderBy: { id: 'asc' },
  });
  if (!pending.length) throw new HttpError(409, 'No pending requests to simulate. Send requests to hospitals first.');
  pending.forEach((r, i) => {
    setTimeout(() => respond(r.id, DEMO_PATTERN[i % DEMO_PATTERN.length]).catch(() => {}), 1500 * (i + 1));
  });
  return { scheduled: pending.length };
}

/** Demo: moves the ambulance to the selected hospital in 20 one-second steps. */
export async function startMovement(emergencyId) {
  const em = await prisma.emergencyRequest.findUnique({
    where: { id: emergencyId },
    include: { ambulance: true, selectedHospital: true },
  });
  if (!em) throw new HttpError(404, 'Emergency not found.');
  if (!em.selectedHospital) throw new HttpError(409, 'Confirm a hospital before simulating ambulance movement.');
  if (sims.has(emergencyId)) return { running: true };

  const amb = em.ambulance;
  const hospital = em.selectedHospital;
  const restart = em.status === 'ARRIVED';
  const start = restart ? { latitude: amb.homeLatitude, longitude: amb.homeLongitude } : pos(amb);
  if (restart) await prisma.emergencyRequest.update({ where: { id: emergencyId }, data: { status: 'CONFIRMED' } });

  const STEPS = 20;
  let step = 0;
  const timer = setInterval(async () => {
    try {
      step += 1;
      const t = step / STEPS;
      const latitude = start.latitude + (hospital.latitude - start.latitude) * t;
      const longitude = start.longitude + (hospital.longitude - start.longitude) * t;
      const arrived = step >= STEPS;

      await prisma.ambulance.update({ where: { id: amb.id }, data: { latitude, longitude } });
      if (arrived) {
        clearInterval(timer);
        sims.delete(emergencyId);
        await prisma.emergencyRequest.update({ where: { id: emergencyId }, data: { status: 'ARRIVED' } });
      }
      const payload = {
        emergencyId,
        latitude,
        longitude,
        ...(arrived ? { distanceKm: 0, etaMinutes: 0 } : metrics({ latitude, longitude }, hospital)),
        arrived,
      };
      emitToEmergency(emergencyId, 'ambulance:location', payload);
      emitToHospital(hospital.id, 'ambulance:location', payload);
      if (arrived) await broadcast(emergencyId);
    } catch (err) {
      console.error('Movement simulation stopped:', err);
      clearInterval(timer);
      sims.delete(emergencyId);
    }
  }, 1000);

  sims.set(emergencyId, { timer, ambulanceId: amb.id });
  return { running: true };
}

/* ---------- dashboard stats ---------- */

export async function getStats() {
  const [active, responded, accepted, timings, recent] = await Promise.all([
    prisma.emergencyRequest.count({ where: { status: { in: ACTIVE } } }),
    prisma.hospitalResponse.count({ where: { respondedAt: { not: null } } }),
    prisma.hospitalResponse.count({ where: { respondedAt: { not: null }, status: { not: 'DECLINED' } } }),
    prisma.hospitalResponse.findMany({ where: { respondedAt: { not: null } }, select: { createdAt: true, respondedAt: true } }),
    prisma.emergencyRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, emergencyType: true, status: true, createdAt: true, ambulance: { select: { ambulanceNumber: true } } },
    }),
  ]);
  const avgResponseSeconds = timings.length
    ? Math.round(timings.reduce((sum, t) => sum + (t.respondedAt - t.createdAt), 0) / timings.length / 1000)
    : null;
  return { activeEmergencies: active, hospitalsResponded: responded, acceptedRequests: accepted, avgResponseSeconds, recent };
}
