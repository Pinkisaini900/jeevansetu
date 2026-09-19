export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-');
export const fmtCoord = (n) => Number(n).toFixed(4);
export const fmtSeconds = (s) => (s == null ? '-' : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);
export const eta = (m) => (m === 0 ? 'Arrived' : `${m} min`);
