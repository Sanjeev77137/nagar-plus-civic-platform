import { useRef, useState } from 'react';
import { Award, CheckCircle2, Sparkles, ImagePlus } from 'lucide-react';
import CameraGalleryButtons from '@/components/CameraGalleryButtons';
import GeoTagBadge from '@/components/GeoTagBadge';
import { GpsState } from '@/lib/useGpsTracker';

interface KarmaCardProps {
  onVerified: () => void;
  verified: boolean;
  ticketNo: string | null;
  gps: GpsState;
  onPhotoPicked: (file: File) => void;
}

type PhotoSlot = 'before' | 'after';

export default function KarmaCard({ onVerified, verified, ticketNo, gps, onPhotoPicked }: KarmaCardProps) {
  const [photos, setPhotos] = useState<{ before: string | null; after: string | null }>({
    before: null,
    after: null,
  });
  const [slot, setSlot] = useState<PhotoSlot | null>(null);
  const targetSlot = useRef<PhotoSlot>('before');

  const handlePick = (file: File) => {
    onPhotoPicked(file);
    setPhotos((p) => {
      const next = { ...p, [targetSlot.current]: URL.createObjectURL(file) };
      if (next.before && next.after && !verified) onVerified();
      return next;
    });
    setSlot(targetSlot.current);
  };

  const boxes: { id: PhotoSlot; title: string; sub: string; filled: string | null; ring: string; badge: string }[] = [
    {
      id: 'before',
      title: 'Before',
      sub: 'Damaged Road',
      filled: photos.before,
      ring: 'border-slate-200 hover:border-amber-400',
      badge: 'bg-slate-900/85',
    },
    {
      id: 'after',
      title: 'After',
      sub: 'Repaired',
      filled: photos.after,
      ring: 'border-slate-200 hover:border-emerald-400',
      badge: 'bg-emerald-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Verification &amp; Karma</h3>
        <p className="text-sm text-slate-500">
          {ticketNo ? `Upload before & after photos of ticket #${ticketNo} to verify the fix` : 'Tap each box to add a real repair photo'}
        </p>
      </div>
      <div className="p-5">
        <CameraGalleryButtons
          onPick={(file) => {
            targetSlot.current = photos.before ? 'after' : 'before';
            handlePick(file);
          }}
        />
        <p className="mt-1.5 text-[11px] text-slate-400">
          Photos go to the {photos.before ? 'After' : 'Before'} box · auto-captures GPS in background
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {boxes.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                targetSlot.current = b.id;
                setSlot(b.id);
              }}
              className={`relative rounded-xl overflow-hidden border-2 ${b.ring} group h-44 text-left transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              aria-label={`Select ${b.id} repair photo box`}
            >
              {b.filled ? (
                <img src={b.filled} alt={`${b.title} repair photo`} className="w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 group-hover:from-blue-50 group-hover:to-emerald-50 transition-colors">
                  <span className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center">
                    <ImagePlus className="w-5 h-5 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                  </span>
                  <span className="text-sm font-semibold text-slate-600">
                    {slot === b.id ? 'Selected — pick a photo above' : `Tap to select ${b.title} box`}
                  </span>
                  <span className="text-[11px] text-slate-400">Then use Camera or Gallery buttons</span>
                </span>
              )}
              {b.filled && (
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </span>
              )}
            </button>
          ))}
        </div>

        <GeoTagBadge gps={gps} />

        {verified && (
          <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pop">
            <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {ticketNo ? `Ticket #${ticketNo}` : 'Repair'} Verified &amp; Closed — thank you for confirming!
            </p>
            <span className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-full text-sm font-bold text-emerald-700 bg-white border border-emerald-300 shadow-[0_0_18px_2px_rgba(16,185,129,0.45)] animate-glow">
              <Award className="w-4 h-4" />
              +50 Citizen Karma Points Credited!
            </span>
          </div>
        )}
        {!verified && (
          <p className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Upload both photos to automatically verify the ticket and earn Karma Points.
          </p>
        )}
      </div>
    </div>
  );
}
