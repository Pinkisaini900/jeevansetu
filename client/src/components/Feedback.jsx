import { AlertTriangle, Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm font-medium text-slate-500">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" /> {label}...
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-0.5">{message}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="btn-secondary !px-3 !py-1.5">Try again</button>}
    </div>
  );
}

export function Notice({ tone = 'info', children }) {
  const cls = tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-indigo-200 bg-indigo-50 text-indigo-900';
  return <div role="status" className={`rounded-xl border p-3 text-sm ${cls}`}>{children}</div>;
}
