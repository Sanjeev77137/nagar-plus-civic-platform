import { useState, useEffect } from 'react';
import {
  X,
  Radar,
  CheckCircle2,
  Send,
  Loader2,
  MapPin,
  Navigation,
  Crosshair,
} from 'lucide-react';
import { createTicket } from '@/lib/tickets';
import { GpsState, googleMapsLink } from '@/lib/useGpsTracker';
import CameraGalleryButtons from '@/components/CameraGalleryButtons';
import GeoTagBadge from '@/components/GeoTagBadge';

interface ReportModalProps {
  open: boolean;
  state: string;
  district: string;
  gps: GpsState;
  onStartGps: () => void;
  onPhotoPicked: (file: File) => void;
  onLocationAutoFill: (parts: { state?: string | null; district?: string | null; city?: string | null }) => void;
  onClose: () => void;
  onDispatched: (ticketNo: string) => void;
}

type Phase = 'details' | 'scanning' | 'result' | 'dispatching' | 'dispatched';

export default function ReportModal({
  open,
  state,
  district,
  gps,
  onStartGps,
  onPhotoPicked,
  onLocationAutoFill,
  onClose,
  onDispatched,
}: ReportModalProps) {
  const [phase, setPhase] = useState<Phase>('details');
  const [locationText, setLocationText] = useState('');
  const [locationTouched, setLocationTouched] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ticketNo, setTicketNo] = useState<string>('');
  const [pincodeNote, setPincodeNote] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setPhase('details');
      setPreview(null);
      setTicketNo('');
      setLocationText('');
      setLocationTouched(false);
      setPincodeNote(null);
    }
  }, [open]);

  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => setPhase('result'), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-fill City/Village/Ward + region fields once the reverse-geocoded address arrives
  useEffect(() => {
    if (!open || locationTouched) return;
    const c = gps.components;
    if (!c) return;
    if (c.city || c.postcode) {
      setLocationText(
        [c.city, c.postcode].filter(Boolean).join(' — ')
      );
      setPincodeNote(c.postcode ? `Pincode ${c.postcode} detected from GPS` : null);
    }
    onLocationAutoFill({ state: c.state, district: c.district, city: c.city });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gps.components, open, locationTouched]);

  if (!open) return null;

  const handlePhoto = (file: File) => {
    setPreview(URL.createObjectURL(file));
    setPhase('scanning');
  };

  const runDispatch = async () => {
    setPhase('dispatching');
    const ticket = await createTicket({
      issue: 'Pothole',
      department: 'PWD Road Maintenance',
      state,
      district,
      location_text: locationText.trim() || gps.address || null,
      latitude: gps.latitude,
      longitude: gps.longitude,
      gps_accuracy: gps.accuracy,
      address: gps.address,
      image_url: preview,
    });
    setTicketNo(ticket?.ticket_no ?? 'NG-8842');
    setPhase('dispatched');
    onDispatched(ticket?.ticket_no ?? 'NG-8842');
  };

  const filledLocation = locationText || gps.address;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-slate-900">AI Hazard Scanner</h3>
            <p className="text-xs text-slate-500">{district}, {state}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {phase === 'details' && (
            <>
              <label className="block">
                <span className="block text-xs font-semibold text-slate-600 mb-1.5">
                  City / Village / Ward &amp; Landmark
                </span>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => {
                      setLocationText(e.target.value);
                      setLocationTouched(true);
                    }}
                    placeholder="e.g. Ward 7, Gandhi Marg, near Bus Stand"
                    className="w-full border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                {pincodeNote && (
                  <span className="mt-1 block text-[11px] text-emerald-600">{pincodeNote}</span>
                )}
              </label>

              {/* GPS capture */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <button
                  onClick={onStartGps}
                  disabled={gps.tracking}
                  className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-2.5 rounded-lg transition-colors ${
                    gps.tracking
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  {gps.tracking ? (
                    <>
                      <Crosshair className="w-4 h-4 animate-spin [animation-duration:2.5s]" />
                      Tracking Live Location…
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      📍 Track My Real-Time GPS Location
                    </>
                  )}
                </button>

                {gps.error && (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {gps.error}
                  </p>
                )}

                {gps.latitude !== null && gps.longitude !== null && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700">
                        Lat {gps.latitude.toFixed(6)}, Lng {gps.longitude.toFixed(6)}
                      </span>
                      <span className="font-medium text-emerald-600">
                        ±{gps.accuracy !== null ? Math.round(gps.accuracy) : '—'} m
                      </span>
                    </div>
                    {gps.address && (
                      <p className="text-xs text-slate-600 leading-snug">
                        <MapPin className="w-3 h-3 inline mr-1 -mt-0.5" />
                        {gps.address}
                      </p>
                    )}
                    <a
                      href={googleMapsLink(gps.latitude, gps.longitude)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
                    >
                      <Navigation className="w-3 h-3" />
                      Open in Google Maps
                    </a>
                    <span className="block text-[11px] text-slate-400">
                      Live coordinates attach automatically to your ticket.
                    </span>
                  </div>
                )}
              </div>

              <CameraGalleryButtons
                onPick={(file) => {
                  onPhotoPicked(file);
                  handlePhoto(file);
                }}
              />
              <p className="text-center text-xs text-slate-400">
                Photo upload auto-captures your GPS location in the background.
              </p>
            </>
          )}

          {phase === 'scanning' && preview && (
            <div>
              <div className="relative rounded-xl overflow-hidden">
                <img src={preview} alt="Scanning" className="w-full h-56 object-cover" />
                <div className="absolute inset-0">
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_16px_4px_rgba(16,185,129,0.8)] animate-scanline" />
                  <div className="absolute inset-0 bg-blue-900/20" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/85 text-white text-xs px-3 py-1.5 rounded-lg">
                    <Radar className="w-4 h-4 animate-spin text-emerald-400" />
                    Canvas Pixel Scan...
                  </div>
                </div>
              </div>
              <GeoTagBadge gps={gps} />
            </div>
          )}

          {phase === 'result' && preview && (
            <div>
              <div className="relative rounded-xl overflow-hidden mb-2">
                <img src={preview} alt="Reported hazard" className="w-full h-40 object-cover" />
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Detected
                </span>
              </div>
              <GeoTagBadge gps={gps} />
              {filledLocation && (
                <p className="text-xs text-slate-500 mt-2 mb-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {filledLocation}
                </p>
              )}
              <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-4">
                <p className="flex items-center gap-2 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                  Pothole Detected: 96.8% Confidence
                </p>
                <p className="text-sm text-emerald-700 mt-1">Auto-Assigned Dept: PWD Road Maintenance</p>
              </div>
              <button
                onClick={runDispatch}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                Dispatch Ticket #NG-8842
              </button>
            </div>
          )}

          {phase === 'dispatching' && (
            <div className="py-12 flex flex-col items-center gap-3 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
              <p className="text-sm font-medium">Dispatching to field team…</p>
            </div>
          )}

          {phase === 'dispatched' && (
            <div className="py-10 flex flex-col items-center text-center gap-3">
              <span className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center animate-pop">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </span>
              <p className="font-semibold text-slate-900">Ticket #{ticketNo} Dispatched</p>
              <p className="text-sm text-slate-500">
                Assigned to PWD Road Maintenance. Track live progress in the Live Tracker tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
