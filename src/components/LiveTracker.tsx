import { CheckCircle2, Circle, LoaderCircle, Navigation } from 'lucide-react';
import { STATUS_LABELS, STATUS_STEPS, Ticket, TicketStatus } from '@/lib/supabase';
import { googleMapsLink } from '@/lib/useGpsTracker';
import LocationChip from '@/components/LocationChip';

interface LiveTrackerProps {
  ticket: Ticket | null;
}

export default function LiveTracker({ ticket }: LiveTrackerProps) {
  const current = ticket ? ticket.status : 'dispatched';
  const currentIndex = STATUS_STEPS.indexOf(current as TicketStatus);

  const ticketNo = ticket?.ticket_no ?? 'NG-8842';
  const department = ticket?.department ?? 'PWD Road Maintenance';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Ticket #{ticketNo}</h3>
            <p className="text-sm text-slate-500">
              {ticket?.issue ?? 'Pothole'} · {department}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            Live Tracking
          </span>
        </div>

        {ticket && (
          <div className="mb-6 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
            <LocationChip
              locationText={ticket.location_text}
              address={ticket.address}
              latitude={ticket.latitude}
              longitude={ticket.longitude}
            />
            {ticket.gps_accuracy !== null && (
              <span className="mt-1.5 inline-block text-[11px] text-slate-400">
                GPS accuracy ±{Math.round(ticket.gps_accuracy)} m
              </span>
            )}
          </div>
        )}

        <ol className="relative ml-3">
          <span className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" aria-hidden />
          {STATUS_STEPS.map((step, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            const pending = i > currentIndex;
            return (
              <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                <span className="relative z-10 mt-0.5">
                  {done && (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 bg-white rounded-full" />
                  )}
                  {active && (
                    <span className="relative flex w-6 h-6 items-center justify-center">
                      <span className="absolute inset-0 rounded-full bg-blue-600/30 animate-ping" />
                      <LoaderCircle className="w-6 h-6 text-blue-800 bg-white rounded-full animate-spin [animation-duration:2.5s]" />
                    </span>
                  )}
                  {pending && <Circle className="w-6 h-6 text-slate-300 bg-white rounded-full" />}
                </span>
                <div>
                  <p
                    className={`font-semibold ${
                      done ? 'text-slate-900' : active ? 'text-blue-800' : 'text-slate-400'
                    }`}
                  >
                    {STATUS_LABELS[step]}
                  </p>
                  <p
                    className={`text-xs mt-0.5 font-medium ${
                      done ? 'text-emerald-600' : active ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  >
                    {done ? 'Completed' : active ? 'In Progress' : 'Pending'}
                  </p>
                  {active && step === 'dispatched' && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-900">
                      Field team <span className="font-semibold">BR-07</span> is en route to{' '}
                      {ticket?.district ?? 'Banka'}. Estimated arrival: 42 min.
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {ticket?.latitude != null && ticket?.longitude != null && (
          <a
            href={googleMapsLink(ticket.latitude, ticket.longitude)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-sm py-3 rounded-xl transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Open in Google Maps — Navigate to Hazard Site
          </a>
        )}
      </div>
    </div>
  );
}
