import { Link } from 'react-router-dom';

import {
  Ambulance,
  QrCode,
  Building2,
  CheckCircle2,
  MapPinned,
  Radio,
  ShieldCheck,
  ClipboardList,
  ArrowUpRight,
  Activity
} from 'lucide-react';

import { Card } from '../components/ui';

const steps = [
  [QrCode, 'Scan', 'Scan the QR code on the ambulance.'],
  [ClipboardList, 'Describe', 'Enter suspected emergency type and patient basics.'],
  [Building2, 'Request', 'Ask several suitable hospitals to accept.'],
  [CheckCircle2, 'Confirm', 'Pick one hospital that accepted.'],
  [MapPinned, 'Prepare', 'The hospital sees live ETA and prepares.']
];

const feats = [
  [
    Radio,
    'Real-time responses',
    'Accept and decline updates arrive instantly.'
  ],
  [
    ShieldCheck,
    'No silent assumptions',
    'No response is never treated as acceptance.'
  ],
  [
    Building2,
    'Simple for staff',
    'Hospitals only tap Accept or Decline.'
  ],
  [
    MapPinned,
    'Live ETA',
    'Selected hospital tracks the ambulance on a map.'
  ]
];

export default function Landing() {
  return (
    <div className="space-y-24">

      {/* ================= HERO ================= */}
      <section className="grid items-center gap-8 py-2 md:grid-cols-2">

        {/* ================= LEFT ================= */}
        <div className="max-w-xl -mt-6 md:-mt-10">

          <h1 className="text-5xl font-light leading-[1.05] tracking-tight text-slate-100 md:text-7xl">
            One Scan.
            <br />

            <span className="font-bold text-cyan-300">
              The Right Hospital.
            </span>

            <br />

            <span className="font-light">
              In Time.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400 md:whitespace-nowrap">
            Helping patients find the right care when every second matters.
          </p>

          {/* ACTION BUTTONS */}
<div className="mt-5 flex flex-col items-center gap-3">

  {/* Two main buttons */}
  <div className="flex flex-wrap items-center justify-center gap-3">
    <Link
      to="/emergency"
      className="group inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition-all duration-300 hover:-translate-y-1 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
    >
      Start Emergency
      <ArrowUpRight
        size={17}
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>

    <Link
      to="/hospital"
      className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/10 hover:text-cyan-300"
    >
      Hospital Login
    </Link>
  </div>

  {/* Ambulance QR */}
    <Link
    to="/qr"
    className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/5 px-5 py-2.5 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-400/10"
  >
    <QrCode size={16} />
    Ambulance QR
  </Link>

</div>  {/* ACTION BUTTONS */}

</div>  {/* LEFT */}

{/* ================= RIGHT VISUAL ================= */}

        {/* ================= RIGHT VISUAL ================= */}
        <div className="-mt-4 md:-mt-10">

          {/* LIVE LABEL */}
          <div className="mb-3 flex items-center justify-end gap-3 text-xs font-semibold tracking-[0.2em] text-cyan-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            LIVE EMERGENCY NETWORK
          </div>

          {/* VISUAL BOX */}
          <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/50 md:min-h-[360px]">

            {/* CENTER GLOW */}
            <div className="absolute h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            {/* DECORATIVE DOTS */}
            <div className="absolute left-10 top-12 grid grid-cols-6 gap-2 opacity-40">
              {Array.from({ length: 36 }).map((_, i) => (
                <span
                  key={i}
                  className="h-1 w-1 rounded-full bg-cyan-300"
                />
              ))}
            </div>

            {/* CONNECTION LINE */}
            <div className="absolute left-[18%] right-[18%] top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            {/* AMBULANCE */}
            <div className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_50px_rgba(34,211,238,0.12)] transition-all duration-500 hover:scale-110 hover:border-cyan-400/60">

              <Ambulance
                size={58}
                strokeWidth={1.3}
                className="text-cyan-300"
              />

            </div>

            {/* LIVE INDICATOR */}
            <div className="absolute z-20 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-slate-950/80 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-cyan-300 backdrop-blur">

              <Activity size={12} />

              LIVE

            </div>

            {/* HOSPITAL */}
            <div className="absolute right-[13%] flex h-32 w-32 items-center justify-center rounded-full border border-lime-400/20 bg-lime-400/5 shadow-[0_0_50px_rgba(163,230,53,0.08)] transition-all duration-500 hover:scale-110 hover:border-lime-400/50">

              <Building2
                size={58}
                strokeWidth={1.3}
                className="text-lime-300"
              />

            </div>

            {/* AMBULANCE LABEL */}
            <div className="absolute bottom-10 left-10 text-xs">

              <div className="font-semibold text-white">
                AMBULANCE
              </div>

              <div className="mt-1 text-slate-500">
                Emergency request
              </div>

            </div>

            {/* HOSPITAL LABEL */}
            <div className="absolute bottom-10 right-10 text-right text-xs">

              <div className="font-semibold text-white">
                HOSPITAL
              </div>

              <div className="mt-1 text-slate-500">
                Ready to prepare
              </div>

            </div>

          </div>
        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section>

        <div className="mb-8 flex items-end justify-between gap-4">

          <div>

            <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-cyan-400">
              THE PROCESS
            </div>

            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              How it works
            </h2>

          </div>

          <div className="hidden text-right text-xs text-slate-500 sm:block">
            From emergency
            <br />
            to hospital readiness
          </div>

        </div>


        <div className="grid gap-3 sm:grid-cols-5">

          {steps.map(([I, t, d], i) => (

            <Card
              key={t}
              className="group !border-white/10 !bg-slate-900/70 !p-5 transition-all duration-300 hover:-translate-y-2 hover:!border-cyan-400/40 hover:!bg-slate-800/90 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]"
            >

              <div className="mb-5 flex items-center justify-between">

                <I
                  size={23}
                  className="text-cyan-400 transition-transform duration-300 group-hover:scale-110"
                />

                <span className="text-xs text-slate-600">
                  0{i + 1}
                </span>

              </div>

              <div className="font-semibold text-white">
                {t}
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {d}
              </p>

            </Card>

          ))}

        </div>

      </section>


      {/* ================= KEY FEATURES ================= */}
      <section className="pb-10">

        <div className="mb-8">

          <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-cyan-400">
            CORE SYSTEM
          </div>

          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Built for emergency coordination.
          </h2>

        </div>


        <div className="grid gap-3 sm:grid-cols-2">

          {feats.map(([I, t, d]) => (

            <Card
              key={t}
              className="group flex gap-4 !border-white/10 !bg-slate-900/70 transition-all duration-300 hover:-translate-y-1 hover:!border-cyan-400/30 hover:!bg-slate-800/90 hover:shadow-[0_0_30px_rgba(34,211,238,0.10)]"
            >

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5">

                <I
                  size={20}
                  className="text-cyan-400 transition-transform duration-300 group-hover:scale-110"
                />

              </div>

              <div>

                <div className="font-semibold text-white">
                  {t}
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {d}
                </p>

              </div>

            </Card>

          ))}

        </div>

      </section>

    </div>
  );
}