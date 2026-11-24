import { MapPin, Navigation } from 'lucide-react';
import { googleMapsLink } from '@/lib/useGpsTracker';

interface LocationChipProps {
  locationText: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function LocationChip({ locationText, address, latitude, longitude }: LocationChipProps) {
  if (!locationText && !address && (latitude === null || longitude === null)) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      {(locationText || address) && (
        <span className="inline-flex items-start gap-1 max-w-[260px]">
          <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
          <span className="line-clamp-2">{locationText || address}</span>
        </span>
      )}
      {latitude !== null && longitude !== null && (
        <>
          <span className="font-mono text-slate-500">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
          <a
            href={googleMapsLink(latitude, longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
          >
            <Navigation className="w-3 h-3" />
            Open in Google Maps
          </a>
        </>
      )}
    </div>
  );
}
