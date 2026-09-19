import { useState } from 'react'; import { Check, X, Loader2 } from 'lucide-react';
import { api, call, useLive } from '../api'; import { Badge, Btn, Card, Err, primary, ghost, inp } from '../components/ui';
export default function HospitalDashboard() {
  const [h, setH] = useState(() => JSON.parse(localStorage.getItem('js_h') || 'null'));
  return h ? <Dash h={h} out={() => { localStorage.removeItem('js_h'); setH(null); }} /> : <Login done={x => { localStorage.setItem('js_h', JSON.stringify(x)); setH(x); }} />;
}
function Login({ done }) {
  const [u, setU] = useState('hospital1'), [p, setP] = useState('demo123'), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const go = async e => { e.preventDefault(); setBusy(true); setErr(''); try { done(await call(api.post('/hospital/login', { username: u, password: p }))); } catch (x) { setErr(x.message); setBusy(false); } };
  return <form onSubmit={go} className="mx-auto max-w-sm space-y-3"><h1 className="text-2xl font-bold">Hospital login</h1><p className="text-sm text-slate-600">Demo accounts: hospital1 to hospital6, password demo123.</p>
    <Card className="space-y-3"><input aria-label="Username" className={inp} value={u} onChange={e => setU(e.target.value)} /><input aria-label="Password" type="password" className={inp} value={p} onChange={e => setP(e.target.value)} /></Card>
    <Err m={err} /><Btn type="submit" disabled={busy} className={`w-full ${primary}`}>{busy && <Loader2 className="animate-spin" size={16} />}Sign in</Btn></form>;
}
function Dash({ h, out }) {
  const [rs, setRs] = useState(null), [err, setErr] = useState('');
  const load = () => call(api.get(`/hospital/${h.id}/requests`)).then(setRs).catch(e => setErr(e.message));
  useLive(load);
  const act = (id, a) => call(api.post(`/hospital/request/${id}/${a}`)).catch(e => setErr(e.message));
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">{h.name}</h1><p className="text-sm text-slate-600">Incoming emergency requests</p></div><Btn onClick={out} className={ghost}>Sign out</Btn></div>
    <Err m={err} />{rs && !rs.length && <Card className="text-sm text-slate-500">No requests yet. They appear here instantly when an ambulance sends one.</Card>}
    <div className="grid gap-4 md:grid-cols-2">{rs?.map(r => <Card key={r.id} className={r.status === 'SELECTED' ? 'border-indigo-300 bg-indigo-50' : ''}>
      <div className="flex justify-between"><h2 className="font-semibold">{r.emergencyType} <span className="text-xs font-normal text-slate-500">suspected</span></h2><Badge s={r.status} /></div>
      <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm"><dt className="text-slate-500">Patient</dt><dd>{r.patientAge} / {r.patientGender}</dd><dt className="text-slate-500">Ambulance</dt><dd>{r.ambulanceId}</dd>
        <dt className="text-slate-500">Distance / ETA</dt><dd>{r.distanceKm} km / {r.etaMin} min</dd><dt className="text-slate-500">Location</dt><dd>{r.location}</dd><dt className="text-slate-500">Received</dt><dd>{new Date(r.receivedAt).toLocaleTimeString()}</dd></dl>
      {r.status === 'REQUESTED' && <div className="mt-3 flex gap-2"><Btn onClick={() => act(r.id, 'accept')} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"><Check size={16} />ACCEPT</Btn><Btn onClick={() => act(r.id, 'decline')} className="flex-1 bg-red-600 text-white hover:bg-red-700"><X size={16} />DECLINE</Btn></div>}
      {r.status === 'ACCEPTED' && <p className="mt-3 text-sm text-slate-600">Accepted. Waiting for the ambulance to choose a hospital.</p>}
      {r.status === 'SELECTED' && <p className="mt-3 text-sm font-semibold text-indigo-900">You are selected. Prepare the team for {r.emergencyType}. Ambulance ETA: {r.distanceKm < 0.1 ? 'arrived' : `${r.etaMin} min`}.</p>}
      {r.status === 'CLOSED' && <p className="mt-3 text-sm text-slate-500">Closed. Another hospital was confirmed.</p>}</Card>)}</div></div>;
}
