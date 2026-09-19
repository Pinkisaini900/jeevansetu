import { useState } from 'react'; import { useParams } from 'react-router-dom'; import { CheckCircle2, Play, Zap } from 'lucide-react';
import { api, call, useLive } from '../api'; import { Badge, Btn, Card, Busy, Err, primary, ghost } from '../components/ui'; import LiveMap from '../components/LiveMap';
export default function Track() {
  const { id } = useParams(), [d, setD] = useState(), [st, setSt] = useState(), [err, setErr] = useState(''), [sim, setSim] = useState(false);
  const load = () => Promise.all([call(api.get(`/emergency/${id}/status`)), call(api.get('/stats'))]).then(([a, b]) => { setD(a); setSt(b); }).catch(e => setErr(e.message));
  useLive(load);
  const act = p => call(p).catch(e => setErr(e.message));
  const move = async () => { setSim(true); for (let i = 0; i < 40; i++) { const r = await call(api.post(`/emergency/${id}/location`)).catch(() => ({ arrived: true })); if (r.arrived) break; await new Promise(x => setTimeout(x, 1000)); } setSim(false); };
  if (!d) return err ? <Err m={err} /> : <Busy />;
  const sel = d.selected, pending = d.responses.some(r => r.status === 'REQUESTED');
  const stats = [['Active Emergencies', st?.active], ['Hospitals Responded', st?.responded], ['Accepted Requests', st?.accepted], ['Avg Response Time', st?.avgResponseSec != null ? `${st.avgResponseSec}s` : '—']];
  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{stats.map(([t, v]) => <Card key={t} className="!p-4"><div className="text-2xl font-bold text-indigo-900">{v ?? '—'}</div><div className="text-xs text-slate-500">{t}</div></Card>)}</div>
    <Err m={err} />
    <div className="grid gap-4 md:grid-cols-2"><div className="space-y-4">
      <Card><h2 className="mb-2 font-semibold">Emergency {d.id}</h2><dl className="grid grid-cols-2 gap-y-1 text-sm">
        <dt className="text-slate-500">Suspected type</dt><dd>{d.emergencyType}</dd><dt className="text-slate-500">Patient</dt><dd>{d.patientAge} / {d.patientGender}</dd>
        <dt className="text-slate-500">Ambulance</dt><dd>{d.ambulanceId}</dd><dt className="text-slate-500">Request time</dt><dd>{new Date(d.createdAt).toLocaleTimeString()}</dd></dl></Card>
      <Card><h2 className="mb-3 font-semibold">Hospital responses</h2>{!d.responses.length && <p className="text-sm text-slate-500">No requests sent yet. Go back and request hospitals.</p>}
        <ul className="space-y-3">{d.responses.map(r => <li key={r.id} className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-sm font-medium">{r.hospital.name}</div><div className="text-xs text-slate-500">{r.distanceKm} km · ETA {r.etaMin} min</div></div>
          <div className="flex items-center gap-2"><Badge s={r.status} />{r.status === 'ACCEPTED' && !sel && <Btn className={`!py-1.5 ${primary}`} onClick={() => act(api.post(`/emergency/${id}/select-hospital`, { hospitalId: r.hospitalId }))}>Select</Btn>}</div></li>)}</ul>
        {pending && !sel && <Btn onClick={() => act(api.post(`/demo/respond/${id}`))} className={`mt-4 w-full ${ghost}`}><Zap size={16} />Simulate Hospital Response (demo)</Btn>}</Card></div>
      <div className="space-y-4">{sel ? <>
        <Card className="border-indigo-200 bg-indigo-50"><div className="flex items-center gap-2 font-semibold text-indigo-900"><CheckCircle2 />Hospital Confirmed</div>
          <p className="mt-2 text-lg font-bold">{sel.hospital.name}</p><p className="text-sm text-slate-600">Ambulance {d.ambulanceId} · {sel.distanceKm < 0.1 ? 'Arrived' : `ETA ${sel.etaMin} min · ${sel.distanceKm} km`} · Status: Confirmed</p></Card>
        <Card><div className="mb-2 flex items-center justify-between"><span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">DEMO LIVE LOCATION</span></div>
          <LiveMap amb={[d.ambulance.latitude, d.ambulance.longitude]} hosp={[sel.hospital.latitude, sel.hospital.longitude]} />
          <Btn disabled={sim || sel.distanceKm < 0.1} onClick={move} className={`mt-3 w-full ${primary}`}><Play size={16} />Simulate Ambulance Movement</Btn></Card></>
        : <Card className="text-sm text-slate-600">Waiting for a hospital to accept. Once one accepts, select it to confirm and see the ambulance's demo live location.</Card>}</div></div></div>;
}
