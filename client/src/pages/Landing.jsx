import { Link } from 'react-router-dom'; import { Ambulance, QrCode, Building2, CheckCircle2, MapPinned, Radio, ShieldCheck, ClipboardList } from 'lucide-react';
import { Card } from '../components/ui';
const steps = [[QrCode, 'Scan', 'Scan the QR code on the ambulance.'], [ClipboardList, 'Describe', 'Enter suspected emergency type and patient basics.'], [Building2, 'Request', 'Ask several suitable hospitals to accept.'], [CheckCircle2, 'Confirm', 'Pick one hospital that accepted.'], [MapPinned, 'Prepare', 'The hospital sees live ETA and prepares.']];
const feats = [[Radio, 'Real-time responses', 'Accept and decline updates arrive instantly.'], [ShieldCheck, 'No silent assumptions', 'No response is never treated as acceptance.'], [Building2, 'Simple for staff', 'Hospitals only tap Accept or Decline.'], [MapPinned, 'Live ETA', 'Selected hospital tracks the ambulance on a map.']];
export default function Landing() {
  return <div className="space-y-14">
    <section className="grid items-center gap-8 py-8 md:grid-cols-2"><div>
      <h1 className="text-4xl font-bold tracking-tight text-indigo-950 md:text-5xl">One Scan. The Right Hospital. In Time.</h1>
      <p className="mt-4 max-w-md text-slate-600">JeevanSetu connects an ambulance with suitable nearby hospitals before arrival, so the team is ready when the patient is.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Link to="/emergency" className="rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-800">Start Emergency</Link>
        <Link to="/hospital" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Hospital Login</Link></div></div>
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10"><div className="flex items-center gap-6 text-indigo-700"><Ambulance size={72} strokeWidth={1.3} /><div className="h-px w-12 border-t-2 border-dashed border-indigo-300" /><Building2 size={72} strokeWidth={1.3} /></div></div></section>
    <section><h2 className="mb-4 text-xl font-semibold">How it works</h2><div className="grid gap-3 sm:grid-cols-5">{steps.map(([I, t, d], i) => <Card key={t} className="!p-4"><I className="mb-2 text-indigo-700" size={22} /><div className="font-semibold">{i + 1}. {t}</div><p className="mt-1 text-sm text-slate-600">{d}</p></Card>)}</div></section>
    <section><h2 className="mb-4 text-xl font-semibold">Key features</h2><div className="grid gap-3 sm:grid-cols-2">{feats.map(([I, t, d]) => <Card key={t} className="flex gap-3"><I className="mt-0.5 shrink-0 text-indigo-700" /><div><div className="font-semibold">{t}</div><p className="text-sm text-slate-600">{d}</p></div></Card>)}</div></section></div>;
}
