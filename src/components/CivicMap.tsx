import { MapPin } from 'lucide-react';

export interface Hazard {
  id: number;
  type: 'pothole' | 'garbage' | 'resolved';
  x: number;
  y: number;
}

const HAZARDS: Hazard[] = [
  { id: 1, type: 'pothole', x: 22, y: 30 },
  { id: 2, type: 'garbage', x: 58, y: 22 },
  { id: 3, type: 'resolved', x: 74, y: 55 },
  { id: 4, type: 'pothole', x: 38, y: 66 },
  { id: 5, type: 'resolved', x: 15, y: 72 },
  { id: 6, type: 'garbage', x: 85, y: 32 },
  { id: 7, type: 'pothole', x: 66, y: 78 },
  { id: 8, type: 'resolved', x: 45, y: 44 },
];

const PIN_COLORS: Record<Hazard['type'], string> = {
  pothole: 'bg-red-500',
  garbage: 'bg-yellow-400',
  resolved: 'bg-emerald-500',
};

const PIN_LABELS: Record<Hazard['type'], string> = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  resolved: 'Resolved',
};

export default function CivicMap() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">Banka District — Live Hazard Map</h3>
          <p className="text-sm text-slate-500">Community-reported civic hazards</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          {(['pothole', 'garbage', 'resolved'] as const).map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${PIN_COLORS[t]}`} />
              {PIN_LABELS[t]}
            </span>
          ))}
        </div>
      </div>
      <div className="relative h-80 bg-gradient-to-br from-blue-50 via-emerald-50/40 to-slate-100">
        {/* stylized district map backdrop */}
        <svg className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path d="M0 35 Q 25 25 50 32 T 100 28" fill="none" stroke="#93c5fd" strokeWidth="1.4" />
          <path d="M0 62 Q 30 70 55 60 T 100 66" fill="none" stroke="#93c5fd" strokeWidth="1.4" />
          <path d="M30 0 Q 36 30 28 55 T 36 100" fill="none" stroke="#6ee7b7" strokeWidth="1.4" />
          <path d="M72 0 Q 64 40 76 68 T 68 100" fill="none" stroke="#6ee7b7" strokeWidth="1.4" />
          <circle cx="50" cy="48" r="10" fill="#dbeafe" opacity="0.7" />
        </svg>
        <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
          NagarPulse Grid View
        </span>
        {HAZARDS.map((h, i) => (
          <div
            key={h.id}
            className="absolute -translate-x-1/2 -translate-y-full group"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <button
              className={`relative flex items-center justify-center ${PIN_COLORS[h.type]} rounded-full rounded-bl-none w-8 h-8 shadow-lg shadow-black/10 hover:scale-110 transition-transform cursor-pointer animate-pulse`}
              style={{ animationDelay: `${i * 0.35}s`, animationDuration: '3s' }}
              aria-label={PIN_LABELS[h.type]}
            >
              <MapPin className="w-4 h-4 text-white" />
            </button>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap bg-slate-900 text-white text-[11px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              {PIN_LABELS[h.type]} · Zone {h.id}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
