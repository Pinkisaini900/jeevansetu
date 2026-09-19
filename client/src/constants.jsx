import { Bone, Brain, Droplets, Flame, HeartPulse, Baby, Stethoscope, Wind, Clock, CheckCircle2, XCircle, ShieldCheck, Lock } from 'lucide-react';

export const EMERGENCY_TYPES = [
  { value: 'TRAUMA', label: 'Accident / Trauma', icon: Bone },
  { value: 'CARDIAC', label: 'Cardiac', icon: HeartPulse },
  { value: 'STROKE', label: 'Stroke', icon: Brain },
  { value: 'RESPIRATORY', label: 'Respiratory', icon: Wind },
  { value: 'PREGNANCY', label: 'Pregnancy', icon: Baby },
  { value: 'BURNS', label: 'Burns', icon: Flame },
  { value: 'BLEEDING', label: 'Severe Bleeding', icon: Droplets },
  { value: 'OTHER', label: 'Other', icon: Stethoscope },
];
export const typeMeta = (value) => EMERGENCY_TYPES.find((t) => t.value === value) || EMERGENCY_TYPES[7];

// Hospital response statuses -> label, badge colours, icon. Class names are written out in full so Tailwind keeps them.
export const RESPONSE_STATUS = {
  REQUESTED: { label: 'Awaiting response', cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: Clock },
  ACCEPTED: { label: 'Accepted', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  DECLINED: { label: 'Declined', cls: 'bg-red-50 text-red-800 border-red-200', icon: XCircle },
  SELECTED: { label: 'Confirmed', cls: 'bg-indigo-700 text-white border-indigo-700', icon: ShieldCheck },
  CLOSED: { label: 'Closed', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: Lock },
};

export const EMERGENCY_STATUS = {
  CREATED: { label: 'Details recorded', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
  REQUESTED: { label: 'Requests sent', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  CONFIRMED: { label: 'Hospital confirmed', cls: 'bg-indigo-700 text-white border-indigo-700' },
  ARRIVED: { label: 'Ambulance arrived', cls: 'bg-emerald-700 text-white border-emerald-700' },
};

export const PREP_LABEL = { NONE: 'Not started', PREPARING: 'Preparing for arrival', READY: 'Ready to receive patient' };
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
