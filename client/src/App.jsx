import { Routes, Route, Link } from 'react-router-dom'; import { HeartPulse } from 'lucide-react';
import Landing from './pages/Landing'; import Emergency from './pages/Emergency'; import Hospitals from './pages/Hospitals';
import Track from './pages/Track'; import HospitalDashboard from './pages/HospitalDashboard'; import QrPage from './pages/QrPage';
export default function App() {
  return <>
  <header className="bg-transparent">
  <div className="mx-auto flex max-w-6xl items-center px-4 py-5">
    <Link
      to="/"
      className="flex items-center gap-2 text-lg font-bold text-white transition-colors duration-300 hover:text-cyan-300"
    >
      <HeartPulse className="text-cyan-400" size={22} />
      JeevanSetu
    </Link>
  </div>
</header>
    <main className="mx-auto max-w-5xl px-4 py-6"><Routes>
      <Route path="/" element={<Landing />} /><Route path="/emergency" element={<Emergency />} />
      <Route path="/emergency/:id/hospitals" element={<Hospitals />} /><Route path="/track/:id" element={<Track />} />
      <Route path="/hospital" element={<HospitalDashboard />} /><Route path="/qr" element={<QrPage />} /></Routes></main>
    <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-500">Hackathon prototype. Demo data only. Not a medical device, not medically certified, not production-ready.</footer></>;
}
