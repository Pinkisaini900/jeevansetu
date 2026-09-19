import { typeMeta } from '../constants.jsx';
import { fmtTime } from '../utils.js';

export default function EmergencyDetails({ data }) {
  const T = typeMeta(data.emergencyType);
  const rows = [
    ['Emergency ID', data.id],
    ['Suspected emergency type', T.label],
    ['Patient', `${data.patientName}, ${data.patientAge} yrs, ${data.patientGender}`],
    ['Blood group', data.bloodGroup || 'Not provided'],
    ['Ambulance', `${data.ambulance.ambulanceNumber} (${data.ambulance.driverName})`],
    ['Description', data.description],
    ['Created', fmtTime(data.createdAt)],
  ];
  return (
    <dl className="divide-y divide-slate-100 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-3 gap-3 py-2.5">
          <dt className="text-slate-500">{k}</dt>
          <dd className="col-span-2 font-medium text-ink break-words">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
