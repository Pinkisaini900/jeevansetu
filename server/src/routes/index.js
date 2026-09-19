import { Router } from 'express';
import { demoOnly, requireHospital } from '../middleware/auth.js';
import * as emergency from '../controllers/emergencyController.js';
import * as hospital from '../controllers/hospitalController.js';
import * as ambulance from '../controllers/ambulanceController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true, data: { status: 'up', demoMode: process.env.DEMO_MODE !== 'false' } }));

// Ambulance / patient side
router.post('/emergency', emergency.create);
router.get('/hospitals/nearby', emergency.nearby);
router.post('/emergency/:id/request', emergency.requestHospitals);
router.get('/emergency/:id/status', emergency.status);
router.post('/emergency/:id/select-hospital', emergency.selectHospital);
router.get('/ambulances', ambulance.list);
router.get('/ambulance/:id', ambulance.get);
router.get('/stats', emergency.stats);

// Hospital side
router.post('/hospital/login', hospital.login);
router.get('/hospital/requests', requireHospital, hospital.requests);
router.post('/hospital/request/:id/accept', requireHospital, hospital.accept);
router.post('/hospital/request/:id/decline', requireHospital, hospital.decline);
router.post('/hospital/request/:id/prepare', requireHospital, hospital.prepare);

// Demo mode helpers (disabled when DEMO_MODE=false)
router.post('/emergency/:id/simulate-responses', demoOnly, emergency.simulateResponses);
router.post('/emergency/:id/simulate-movement', demoOnly, emergency.simulateMovement);

export default router;
