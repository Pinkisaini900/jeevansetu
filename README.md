# JeevanSetu (hackathon prototype)
One Scan. The Right Hospital. In Time. Demo data only: not a medical device, not medically certified, not production-ready.

## Run locally (Node 18+)
```bash
npm run install:all          # installs root, server and client deps
cp .env.example server/.env  # already present in this zip; edit if needed
npm run setup                # creates SQLite DB + seeds 6 hospitals, 3 ambulances
npm run dev                  # API :4000, web http://localhost:5173
```
Re-run `npm run setup` any time to reset all demo data (including ambulance positions).
Map tiles come from OpenStreetMap, so the map needs internet; everything else works offline.

## Demo script
1. Open `/qr` → click "Open emergency page" for JS-AMB-001 (or scan it from a phone on the same Wi-Fi via your LAN IP).
2. Fill fictional details → **Find Suitable Hospitals** → **Request all suitable**.
3. Open `/hospital` in a second tab (hospital1 / demo123), press **ACCEPT** (or use **Simulate Hospital Response** on the tracking page).
4. On the tracking page click **Select** on an accepted hospital → others become Closed.
5. **Simulate Ambulance Movement** → map + ETA update; the hospital tab shows "You are selected".

## Notes
API: POST /api/emergency, GET /api/hospitals/nearby, POST /api/emergency/:id/request, GET /api/emergency/:id/status, POST /api/hospital/request/:id/accept|decline, POST /api/emergency/:id/select-hospital, GET /api/ambulance/:num. Real-time via Socket.IO event `update`.
Prototype limits: hospital login is not token-protected, ETA = straight-line distance at 35 km/h, no real GPS.
