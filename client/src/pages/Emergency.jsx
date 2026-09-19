import { useState } from 'react'; import { useSearchParams, useNavigate } from 'react-router-dom'; import { Loader2 } from 'lucide-react';
import { api, call, TYPES } from '../api'; import { Btn, Card, Err, primary, inp } from '../components/ui';

const L = ({ t, children }) => (
  <label className="block text-sm font-medium text-slate-700">
    {t}
    <div className="mt-1">{children}</div>
  </label>
);

export default function Emergency() {
  const [sp] = useSearchParams(), nav = useNavigate();
  const [f, setF] = useState({ emergencyType: '', patientName: '', patientAge: '', patientGender: 'Male', description: '', bloodGroup: '', ambulanceId: sp.get('ambulance') || 'JS-AMB-001' });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const set = k => e => {
  setF(prev => ({
    ...prev,
    [k]: e.target.value
  }));
};
  const submit = async e => { e.preventDefault(); if (!f.emergencyType) return setErr('Choose a suspected emergency type'); setBusy(true); setErr('');
    try { nav(`/emergency/${(await call(api.post('/emergency', f))).id}/hospitals`); } catch (x) { setErr(x.message); setBusy(false); } };
  
  return <form onSubmit={submit} className="mx-auto max-w-xl space-y-4">
    <h1 className="text-2xl font-bold">Emergency information</h1>
    <p className="text-sm text-slate-600">Use fictional demo details only. The type below is a suspected emergency type, not a medical diagnosis.</p>
    <Card><div className="mb-2 text-sm font-medium text-slate-700">Suspected emergency type</div>
      <div className="grid grid-cols-2 gap-2">{TYPES.map(t => <button type="button" key={t} aria-pressed={f.emergencyType === t} onClick={() => setF(prev => ({ ...prev, emergencyType: t }))} className={`rounded-lg border px-3 py-3 text-sm font-medium ${f.emergencyType === t ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-slate-300 hover:bg-slate-50'}`}>{t}</button>)}</div></Card>
    <Card className="space-y-3">
      <L t="Patient name"><input className={inp} required value={f.patientName} onChange={set('patientName')} /></L>
      <div className="grid grid-cols-2 gap-3"><L t="Age"><input className={inp} type="number" min="0" max="120" required value={f.patientAge} onChange={set('patientAge')} /></L>
        <L t="Gender"><select className={inp} value={f.patientGender} onChange={set('patientGender')}><option>Male</option><option>Female</option><option>Other</option></select></L></div>
      <L t="Short description"><textarea className={inp} rows="3" maxLength="300" value={f.description} onChange={set('description')} /></L>
      <div className="grid grid-cols-2 gap-3"><L t="Blood group (optional)"><select className={inp} value={f.bloodGroup} onChange={set('bloodGroup')}><option value="">Unknown</option>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <option key={b}>{b}</option>)}</select></L>
        <L t="Ambulance ID"><input className={inp} required value={f.ambulanceId} onChange={set('ambulanceId')} /></L></div></Card>
    <Err m={err} />
    <Btn type="submit" disabled={busy} className={`w-full !py-3.5 ${primary}`}>{busy && <Loader2 className="animate-spin" size={16} />}Find Suitable Hospitals</Btn></form>;
}
