import { Loader2 } from 'lucide-react';

const C = {
  REQUESTED: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  ACCEPTED: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  DECLINED: 'bg-red-400/10 text-red-300 border-red-400/20',
  SELECTED: 'bg-cyan-400 text-slate-950 border-cyan-400',
  CLOSED: 'bg-white/5 text-slate-400 border-white/10'
};

const L = {
  REQUESTED: 'Awaiting Response',
  ACCEPTED: 'Accepted',
  DECLINED: 'Declined',
  SELECTED: 'Confirmed',
  CLOSED: 'Closed'
};

export const Badge = ({ s }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${C[s]}`}>
    {L[s] || s}
  </span>
);

export const Btn = ({ className = '', ...p }) => (
  <button
    {...p}
    className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 ${className}`}
  />
);

export const Card = ({ className = '', ...p }) => (
  <div
    {...p}
    className={`rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-white ${className}`}
  />
);

export const Busy = () => (
  <div className="flex justify-center p-10" role="status">
    <Loader2 className="animate-spin text-cyan-400" />
  </div>
);

export const Err = ({ m }) =>
  m ? (
    <div
      role="alert"
      className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
    >
      {m}
    </div>
  ) : null;

export const primary =
  'bg-cyan-400 text-slate-950 hover:bg-cyan-300';

export const ghost =
  'border border-white/15 bg-white/5 text-white hover:bg-white/10';

export const inp =
  'w-full rounded-lg border border-white/15 bg-slate-900/80 text-white px-3 py-2.5 text-sm placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20';