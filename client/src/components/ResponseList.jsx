import { useState } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { StatusBadge } from './Badges.jsx';
import { eta, fmtTime } from '../utils.js';

/** Live list of hospital responses. Pass onSelect to let the crew choose an accepted hospital. */
export default function ResponseList({ responses, onSelect }) {
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const choose = async (hospitalId) => {
    setBusy(true);
    setError('');
    try {
      await onSelect(hospitalId);
      setConfirming(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!responses.length) {
    return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No requests sent yet. Choose hospitals to ask for emergency acceptance.</p>;
  }

  return (
    <div>
      <ul className="space-y-3">
        {responses.map((r) => (
          <li key={r.id} className={`rounded-xl border p-4 ${r.status === 'SELECTED' ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200'}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold text-ink">{r.hospitalName}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin size={14} aria-hidden="true" />{r.distanceKm} km</span>
                  <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden="true" />ETA {eta(r.etaMinutes)}</span>
                  {r.respondedAt && <span>Responded {fmtTime(r.respondedAt)}</span>}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>

            {onSelect && r.status === 'ACCEPTED' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {confirming === r.hospitalId ? (
                  <>
                    <span className="text-sm font-medium text-ink">Send the ambulance to {r.hospitalName}? Other requests will close.</span>
                    <button className="btn-primary !py-2" disabled={busy} onClick={() => choose(r.hospitalId)}>{busy ? 'Confirming...' : 'Confirm hospital'}</button>
                    <button className="btn-secondary !py-2" disabled={busy} onClick={() => setConfirming(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="btn-success !py-2" onClick={() => setConfirming(r.hospitalId)}>Select this hospital</button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
