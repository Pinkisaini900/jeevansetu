import { EMERGENCY_STATUS, RESPONSE_STATUS } from '../constants.jsx';

const base = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold';

export function StatusBadge({ status, label }) {
  const m = RESPONSE_STATUS[status] || RESPONSE_STATUS.CLOSED;
  const Icon = m.icon;
  return (
    <span className={`${base} ${m.cls}`}>
      <Icon size={13} aria-hidden="true" />
      {label || m.label}
    </span>
  );
}

export function EmergencyBadge({ status }) {
  const m = EMERGENCY_STATUS[status] || EMERGENCY_STATUS.CREATED;
  return <span className={`${base} ${m.cls}`}>{m.label}</span>;
}
