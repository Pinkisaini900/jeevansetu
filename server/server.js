import 'dotenv/config';
import express from 'express'; import cors from 'cors'; import http from 'http';
import { Server } from 'socket.io'; import { PrismaClient } from '@prisma/client'; import bcrypt from 'bcryptjs';

const prisma = new PrismaClient(), app = express(), server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });
app.use(cors(), express.json());

const TYPES = { 'Accident / Trauma': 'Trauma', Cardiac: 'Cardiac', Stroke: 'Neuro', Respiratory: 'Respiratory', Pregnancy: 'Maternity', Burns: 'Burns', 'Severe Bleeding': 'Trauma', Other: 'General' };
const km = (a, b, c, d) => { const r = x => x * Math.PI / 180, h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
const eta = d => Math.max(1, Math.round(d / 35 * 60)); // demo: 35 km/h average speed
const notify = id => io.emit('update', { emergencyId: id });
const ok = (s, data) => s.json({ ok: true, data });
const bad = (s, error, c = 400) => s.status(c).json({ ok: false, error });
const wrap = fn => (q, s) => fn(q, s).catch(e => { console.error(e); bad(s, 'Server error', 500); });
const ambOf = num => prisma.ambulance.findUnique({ where: { ambulanceNumber: num } });

app.get('/api/ambulances', wrap(async (q, s) => ok(s, await prisma.ambulance.findMany())));
app.get('/api/ambulance/:num', wrap(async (q, s) => { const a = await ambOf(q.params.num); a ? ok(s, a) : bad(s, 'Ambulance not found', 404); }));

app.post('/api/emergency', wrap(async (q, s) => {
  const b = q.body, age = Number(b.patientAge);
  if (!TYPES[b.emergencyType] || !b.patientName?.trim() || !(age >= 0 && age <= 120) || !['Male', 'Female', 'Other'].includes(b.patientGender)) return bad(s, 'Please complete emergency type, patient name, age (0-120) and gender');
  const amb = await ambOf(String(b.ambulanceId));
  if (!amb) return bad(s, 'Unknown ambulance ID');
  ok(s, await prisma.emergencyRequest.create({ data: { id: 'EM-' + Date.now().toString(36).toUpperCase(), ambulanceId: amb.ambulanceNumber, patientName: b.patientName.trim().slice(0, 80), patientAge: age, patientGender: b.patientGender, emergencyType: b.emergencyType, description: String(b.description || '').slice(0, 300), bloodGroup: b.bloodGroup || null } }));
}));

app.get('/api/hospitals/nearby', wrap(async (q, s) => {
  const e = await prisma.emergencyRequest.findUnique({ where: { id: String(q.query.emergencyId) } });
  if (!e) return bad(s, 'Emergency not found', 404);
  const a = await ambOf(e.ambulanceId), need = TYPES[e.emergencyType];
  const hs = await prisma.hospital.findMany({ include: { responses: { where: { emergencyRequestId: e.id } } } });
  const hospitals = hs.map(({ password, responses, ...h }) => { const distanceKm = +km(a.latitude, a.longitude, h.latitude, h.longitude).toFixed(1);
    return { ...h, distanceKm, etaMin: eta(distanceKm), suitable: need === 'General' || h.specialties.split(',').includes(need), requestStatus: responses[0]?.status || null }; })
    .sort((x, y) => y.suitable - x.suitable || x.distanceKm - y.distanceKm);
  ok(s, { emergency: e, needed: need, hospitals });
}));

app.post('/api/emergency/:id/request', wrap(async (q, s) => {
  const ids = (q.body.hospitalIds || []).map(Number).filter(Number.isInteger);
  const e = await prisma.emergencyRequest.findUnique({ where: { id: q.params.id }, include: { responses: true } });
  if (!e) return bad(s, 'Emergency not found', 404);
  if (!ids.length) return bad(s, 'Select at least one hospital');
  if (e.status === 'SELECTED') return bad(s, 'A hospital is already confirmed', 409);
  const fresh = ids.filter(i => !e.responses.some(r => r.hospitalId === i));
  await prisma.hospitalResponse.createMany({ data: fresh.map(hospitalId => ({ emergencyRequestId: e.id, hospitalId, status: 'REQUESTED' })) });
  await prisma.emergencyRequest.update({ where: { id: e.id }, data: { status: 'REQUESTED' } });
  notify(e.id); ok(s, { sent: fresh.length });
}));

const details = async id => {
  const e = await prisma.emergencyRequest.findUnique({ where: { id }, include: { responses: { include: { hospital: true } } } });
  if (!e) return null;
  const ambulance = await ambOf(e.ambulanceId);
  const responses = e.responses.map(({ hospital: { password, ...h }, ...r }) => { const d = +km(ambulance.latitude, ambulance.longitude, h.latitude, h.longitude).toFixed(2); return { ...r, hospital: h, distanceKm: d, etaMin: eta(d) }; });
  return { ...e, responses, ambulance, selected: responses.find(r => r.status === 'SELECTED') || null };
};
app.get('/api/emergency/:id/status', wrap(async (q, s) => { const d = await details(q.params.id); d ? ok(s, d) : bad(s, 'Emergency not found', 404); }));

app.post('/api/emergency/:id/select-hospital', wrap(async (q, s) => {
  const id = q.params.id, r = await prisma.hospitalResponse.findFirst({ where: { emergencyRequestId: id, hospitalId: Number(q.body.hospitalId) } });
  if (!r || r.status !== 'ACCEPTED') return bad(s, 'Only a hospital that accepted can be selected', 409);
  await prisma.$transaction([
    prisma.hospitalResponse.update({ where: { id: r.id }, data: { status: 'SELECTED' } }),
    prisma.hospitalResponse.updateMany({ where: { emergencyRequestId: id, id: { not: r.id }, status: { in: ['REQUESTED', 'ACCEPTED'] } }, data: { status: 'CLOSED' } }),
    prisma.emergencyRequest.update({ where: { id }, data: { status: 'SELECTED', selectedHospitalId: r.hospitalId } })]);
  notify(id); ok(s, await details(id));
}));

// Demo: move ambulance 25% of the remaining way toward the selected hospital
app.post('/api/emergency/:id/location', wrap(async (q, s) => {
  const d = await details(q.params.id);
  if (!d?.selected) return bad(s, 'No hospital selected yet', 409);
  const a = d.ambulance, { latitude: hl, longitude: hg } = d.selected.hospital;
  const lat = a.latitude + (hl - a.latitude) * .25, lng = a.longitude + (hg - a.longitude) * .25;
  await prisma.ambulance.update({ where: { id: a.id }, data: { latitude: lat, longitude: lng } });
  notify(d.id); ok(s, { arrived: km(lat, lng, hl, hg) < 0.1 });
}));

app.post('/api/hospital/login', wrap(async (q, s) => {
  const h = await prisma.hospital.findUnique({ where: { username: String(q.body.username || '') } });
  if (!h || !(await bcrypt.compare(String(q.body.password || ''), h.password))) return bad(s, 'Invalid username or password', 401);
  const { password, ...safe } = h; ok(s, safe);
}));

app.get('/api/hospital/:id/requests', wrap(async (q, s) => {
  const h = await prisma.hospital.findUnique({ where: { id: Number(q.params.id) } });
  if (!h) return bad(s, 'Hospital not found', 404);
  const rs = await prisma.hospitalResponse.findMany({ where: { hospitalId: h.id }, include: { emergency: true }, orderBy: { requestedAt: 'desc' } });
  ok(s, await Promise.all(rs.map(async r => { const e = r.emergency, a = await ambOf(e.ambulanceId), d = +km(a.latitude, a.longitude, h.latitude, h.longitude).toFixed(1);
    return { id: r.id, status: r.status, emergencyId: e.id, emergencyType: e.emergencyType, patientAge: e.patientAge, patientGender: e.patientGender, ambulanceId: e.ambulanceId, distanceKm: d, etaMin: eta(d), location: `${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`, receivedAt: r.requestedAt }; })));
}));

const respond = status => wrap(async (q, s) => {
  const r = await prisma.hospitalResponse.findUnique({ where: { id: Number(q.params.id) } });
  if (!r) return bad(s, 'Request not found', 404);
  if (r.status !== 'REQUESTED') return bad(s, `Request is already ${r.status}`, 409); // no response is never treated as acceptance
  await prisma.hospitalResponse.update({ where: { id: r.id }, data: { status, respondedAt: new Date() } });
  notify(r.emergencyRequestId); ok(s, { status });
});
app.post('/api/hospital/request/:id/accept', respond('ACCEPTED'));
app.post('/api/hospital/request/:id/decline', respond('DECLINED'));

// Demo: every pending hospital answers; the last one declines (if more than one)
app.post('/api/demo/respond/:id', wrap(async (q, s) => {
  const rs = await prisma.hospitalResponse.findMany({ where: { emergencyRequestId: q.params.id, status: 'REQUESTED' } });
  for (const [i, r] of rs.entries()) await prisma.hospitalResponse.update({ where: { id: r.id }, data: { status: rs.length > 1 && i === rs.length - 1 ? 'DECLINED' : 'ACCEPTED', respondedAt: new Date() } });
  notify(q.params.id); ok(s, { responded: rs.length });
}));

app.get('/api/stats', wrap(async (q, s) => {
  const [active, rs] = await Promise.all([prisma.emergencyRequest.count({ where: { status: { not: 'CLOSED' } } }), prisma.hospitalResponse.findMany()]);
  const done = rs.filter(r => r.respondedAt);
  ok(s, { active, responded: done.length, accepted: rs.filter(r => ['ACCEPTED', 'SELECTED'].includes(r.status)).length, avgResponseSec: done.length ? Math.round(done.reduce((t, r) => t + (r.respondedAt - r.requestedAt), 0) / done.length / 1000) : null });
}));

server.listen(process.env.PORT || 4000, () => console.log('JeevanSetu API on :' + (process.env.PORT || 4000)));
