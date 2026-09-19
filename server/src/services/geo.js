const R = 6371;
const ROAD_FACTOR = 1.3; // straight line -> rough road distance
export const AVG_SPEED_KMPH = 35; // demo ambulance average speed

const rad = (d) => (d * Math.PI) / 180;

export function haversineKm(a, b) {
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const roadKm = (a, b) => haversineKm(a, b) * ROAD_FACTOR;

export const etaMinutes = (km) => (km < 0.05 ? 0 : Math.max(1, Math.ceil((km / AVG_SPEED_KMPH) * 60)));

/** Distance + ETA between two {latitude, longitude} points. */
export function metrics(from, to) {
  const km = roadKm(from, to);
  return { distanceKm: Math.round(km * 10) / 10, etaMinutes: etaMinutes(km) };
}
