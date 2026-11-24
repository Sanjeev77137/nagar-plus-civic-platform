import { MapPin, Navigation, Radar } from 'lucide-react';
import { GpsState, googleMapsLink } from '@/lib/useGpsTracker';

interface GeoTagBadgeProps {
  gps: GpsState;
}

export default function GeoTagBadge({ gps }: GeoTagBadgeProps) {
  if (gps.latitude === null || gps.longitude === null) return null;

  const time = gps.capturedAt
    ? new Date(gps.capturedAt).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
        <MapPin className="w-3.5 h-3.5" />
        📍 Auto-Captured GPS Location &amp; Timestamp
      </span>
      <span className="font-mono text-slate-600">
        {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}
      </span>
      {gps.accuracy !== null && (
        <span className="text-slate-500">±{Math.round(gps.accuracy)} m</span>
      )}
      {time && <span className="text-slate-500">{time}</span>}
      {gps.tracking && <Radar className="w-3.5 h-3.5 animate-spin text-emerald-600 [animation-duration:2.5s]" />}
      <a
        href={googleMapsLink(gps.latitude, gps.longitude)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
      >
        <Navigation className="w-3 h-3" />
        Open in Google Maps
      </a>
    </div>
  );
}
