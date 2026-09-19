import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const plus = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const ambIcon = (moving) => L.divIcon({ className: '', html: `<div class="map-pin map-pin--amb${moving ? ' is-moving' : ''}">${plus}</div>`, iconSize: [34, 34], iconAnchor: [17, 17] });
const hospIcon = L.divIcon({ className: '', html: '<div class="map-pin map-pin--hosp">H</div>', iconSize: [30, 30], iconAnchor: [15, 15] });
const otherIcon = L.divIcon({ className: '', html: '<div class="map-pin map-pin--other">H</div>', iconSize: [24, 24], iconAnchor: [12, 12] });

/**
 * Leaflet + OpenStreetMap map. Shows the ambulance, the confirmed hospital (if any) and,
 * optionally, other requested hospitals as muted markers. The line is a straight demo route.
 */
export default function LiveMap({ ambulance, hospital, others = [], moving = false, height = 360 }) {
  const el = useRef(null);
  const map = useRef(null);
  const layers = useRef({});
  const fitted = useRef('');

  useEffect(() => {
    const m = L.map(el.current, { scrollWheelZoom: false }).setView([26.4499, 80.3319], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    layers.current = { others: L.layerGroup().addTo(m) };
    map.current = m;
    setTimeout(() => m.invalidateSize(), 0);
    return () => {
      m.remove();
      map.current = null;
      layers.current = {};
      fitted.current = '';
    };
  }, []);

  const othersKey = others.map((o) => o.id).join(',');

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const ly = layers.current;

    // ambulance marker
    if (ambulance) {
      const ll = [ambulance.latitude, ambulance.longitude];
      if (!ly.amb) ly.amb = L.marker(ll, { icon: ambIcon(moving), zIndexOffset: 1000 }).addTo(m).bindTooltip(ambulance.label || 'Ambulance');
      else {
        ly.amb.setLatLng(ll);
        ly.amb.setIcon(ambIcon(moving));
      }
    }

    // selected hospital marker
    if (ly.hosp && ly.hospId !== hospital?.id) {
      ly.hosp.remove();
      ly.hosp = null;
    }
    if (hospital && !ly.hosp) {
      ly.hosp = L.marker([hospital.latitude, hospital.longitude], { icon: hospIcon }).addTo(m).bindTooltip(hospital.name, { permanent: true, direction: 'top', offset: [0, -14] });
      ly.hospId = hospital.id;
    }

    // straight-line route
    if (ly.line) {
      ly.line.remove();
      ly.line = null;
    }
    if (ambulance && hospital) {
      ly.line = L.polyline([[ambulance.latitude, ambulance.longitude], [hospital.latitude, hospital.longitude]], { color: '#3730a3', weight: 4, dashArray: '8 10', opacity: 0.8 }).addTo(m);
    }

    // other requested hospitals
    ly.others.clearLayers();
    others.forEach((o) => L.marker([o.latitude, o.longitude], { icon: otherIcon }).bindTooltip(o.name).addTo(ly.others));

    // fit once per set of hospitals (not on every ambulance step)
    const key = `${hospital?.id ?? 'none'}|${othersKey}`;
    if (fitted.current !== key) {
      const pts = [ambulance, hospital, ...others].filter(Boolean).map((p) => [p.latitude, p.longitude]);
      if (pts.length > 1) m.fitBounds(pts, { padding: [50, 50], maxZoom: 15 });
      else if (pts.length === 1) m.setView(pts[0], 14);
      fitted.current = key;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambulance?.latitude, ambulance?.longitude, hospital?.id, moving, othersKey]);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-slate-200">
      <div ref={el} style={{ height }} className="w-full" role="img" aria-label="Map showing the ambulance and hospital locations" />
      <span className="absolute left-3 top-3 z-10 rounded-md bg-ink px-2.5 py-1 text-xs font-extrabold tracking-wide text-white shadow">DEMO LIVE LOCATION</span>
    </div>
  );
}
