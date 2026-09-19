import { PrismaClient } from '@prisma/client'; import bcrypt from 'bcryptjs';
const p = new PrismaClient();
await p.hospitalResponse.deleteMany(); await p.emergencyRequest.deleteMany(); await p.hospital.deleteMany(); await p.ambulance.deleteMany();
const pw = await bcrypt.hash('demo123', 10);
// name, lat, lng, services, specialties, trauma, icu  (all fictional demo data)
const H = [
 ['Sanjeevani Multispeciality', 28.628, 77.219, 'Emergency,Trauma,ICU', 'Trauma,Neuro,General', true, true],
 ['Lifeline Trauma Centre', 28.601, 77.235, 'Emergency,Trauma,ICU', 'Trauma,Burns', true, true],
 ['Arogya Heart Institute', 28.620, 77.190, 'Emergency,Cardiac Cath Lab,ICU', 'Cardiac,Respiratory', false, true],
 ['City Care Hospital', 28.590, 77.205, 'Emergency,General Ward', 'General,Respiratory', false, false],
 ['Neuro & Stroke Institute', 28.640, 77.230, 'Emergency,Stroke Unit,ICU', 'Neuro,Cardiac', false, true],
 ['Matru Maternity & Child', 28.610, 77.245, 'Emergency,Labour Ward,NICU', 'Maternity,General', false, true]];
for (const [i, h] of H.entries()) await p.hospital.create({ data: { name: h[0], address: `Demo Block ${i + 1}, Fictional City`, latitude: h[1], longitude: h[2], emergencyServices: h[3], specialties: h[4], traumaAvailable: h[5], icuAvailable: h[6], contactName: 'Duty Officer', username: `hospital${i + 1}`, password: pw } });
await p.ambulance.createMany({ data: [
 { ambulanceNumber: 'JS-AMB-001', driverName: 'Demo Driver A', latitude: 28.605, longitude: 77.215 },
 { ambulanceNumber: 'JS-AMB-002', driverName: 'Demo Driver B', latitude: 28.630, longitude: 77.200 },
 { ambulanceNumber: 'JS-AMB-003', driverName: 'Demo Driver C', latitude: 28.595, longitude: 77.230 }] });
console.log('Seeded 6 hospitals (hospital1..6 / demo123) and 3 ambulances');
