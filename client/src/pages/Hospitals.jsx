import { useState } from 'react'; import { useParams, Link } from 'react-router-dom'; import { Clock, MapPin, Send } from 'lucide-react';
import { api, call, useLive } from '../api'; import { Badge, Btn, Card, Busy, Err, primary, ghost } from '../components/ui';
export default function Hospitals() {
  const { id } = useParams(), [d, setD] = useState(), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const load = () => call(api.get('/hospitals/nearby', { params: { emergencyId: id } })).then(setD).catch(e => setErr(e.message));
  useLive(load);
  const send = async ids => { setBusy(true); setErr(''); try { await call(api.post(`/emergency/${id}/request`, { hospitalIds: ids })); await load(); } catch (e) { setErr(e.message); } setBusy(false); };
  if (!d) return err ? <Err m={err} /> : <Busy />;
  const open = d.hospitals.filter(h => h.suitable && !h.requestStatus);
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-bold">Nearby hospitals</h1>
      <p className="text-sm text-slate-600">Emergency {d.emergency.id} · Suspected emergency type: <b>{d.emergency.emergencyType}</b> · Trauma/ICU status is demo data</p></div>
      <div className="flex gap-2"><Btn disabled={busy || !open.length} onClick={() => send(open.map(h => h.id))} className={primary}><Send size={16} />Request all suitable ({open.length})</Btn>
        <Link to={`/track/${id}`} className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold ${ghost}`}>View request status</Link></div></div>
    <Err m={err} />
    <div className="grid gap-4 md:grid-cols-2">{d.hospitals.map(h => <Card key={h.id} className={h.suitable ? '' : 'opacity-70'}>
      <div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{h.name}</h2>{h.requestStatus && <Badge s={h.requestStatus} />}</div>
      <div className="mt-2 flex gap-4 text-sm text-slate-600"><span className="flex items-center gap-1"><MapPin size={14} />{h.distanceKm} km away</span><span className="flex items-center gap-1"><Clock size={14} />ETA: {h.etaMin} min</span></div>
      <p className="mt-2 text-sm">{h.emergencyServices.split(',').join(' • ')}</p>
      <p className="mt-1 text-sm text-slate-600">{h.suitable ? `Relevant speciality: ${d.needed}` : `No ${d.needed} speciality`} · Trauma {h.traumaAvailable ? 'available' : 'unavailable'} · ICU {h.icuAvailable ? 'available' : 'unavailable'} (demo)</p>
      <Btn disabled={busy || !!h.requestStatus} onClick={() => send([h.id])} className={`mt-3 w-full ${h.suitable ? primary : ghost}`}>{h.requestStatus ? 'Request sent' : 'Request Emergency Acceptance'}</Btn></Card>)}</div></div>;
}
