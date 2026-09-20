import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Siren } from 'lucide-react';

export function Logo({ className = '' }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="JeevanSetu home"
    >
      <img
        src="/logo.png"
        alt="JeevanSetu"
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}

const navCls = ({ isActive }) =>
  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${isActive ? 'bg-indigo-50 text-indigo-800' : 'text-slate-600 hover:text-ink'}`;

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="no-print bg-ink px-4 py-1.5 text-center text-xs font-medium text-indigo-100">
        Hackathon prototype. Hospitals, ambulances and patients shown here are fictional demo data. Not a medical device.
      </div>
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            <NavLink to="/qr" className={navCls}>Ambulance QR</NavLink>
            <NavLink to="/dashboard" className={navCls}>Live dashboard</NavLink>
            <NavLink to="/hospital/login" className={navCls}>Hospital login</NavLink>
          </nav>
          <Link to="/emergency" className="btn-primary !py-2">
            <Siren size={16} aria-hidden="true" /> Start Emergency
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-3 py-1.5 md:hidden" aria-label="Main mobile">
          <NavLink to="/qr" className={navCls}>Ambulance QR</NavLink>
          <NavLink to="/dashboard" className={navCls}>Live dashboard</NavLink>
          <NavLink to="/hospital/login" className={navCls}>Hospital login</NavLink>
        </nav>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="no-print border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
          <p className="font-semibold text-ink">JeevanSetu prototype</p>
          <p className="mt-1 max-w-2xl">
            Built to demonstrate emergency hospital coordination. It does not diagnose, is not medically certified and is not production ready.
            Emergency types are the crew's suspected type. Trauma and ICU availability and all live locations are demo data.
          </p>
        </div>
      </footer>
    </div>
  );
}
