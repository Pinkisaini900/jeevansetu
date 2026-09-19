import { Routes, Route, Link } from 'react-router-dom'; import { HeartPulse } from 'lucide-react';
import Landing from './pages/Landing'; import Emergency from './pages/Emergency'; import Hospitals from './pages/Hospitals';
import Track from './pages/Track'; import HospitalDashboard from './pages/HospitalDashboard'; import QrPage from './pages/QrPage';
export default function App() {
  return <>
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-900"><HeartPulse className="text-indigo-700" />JeevanSetu</Link>
      <nav className="flex gap-5 text-sm font-medium text-slate-600"><Link to="/qr">Ambulance QR</Link><Link to="/hospital">Hospital login</Link></nav></div></header>
    <main className="mx-auto max-w-5xl px-4 py-6"><Routes>
      <Route path="/" element={<Landing />} /><Route path="/emergency" element={<Emergency />} />
      <Route path="/emergency/:id/hospitals" element={<Hospitals />} /><Route path="/track/:id" element={<Track />} />
      <Route path="/hospital" element={<HospitalDashboard />} /><Route path="/qr" element={<QrPage />} /></Routes></main>
    <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-500">Hackathon prototype. Demo data only. Not a medical device, not medically certified, not production-ready.</footer></>;
}
