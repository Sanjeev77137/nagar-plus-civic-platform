import { MessageSquare, ShieldCheck } from 'lucide-react';
import { STATUS_LABELS, Ticket, TicketStatus } from '@/lib/supabase';
import LocationChip from '@/components/LocationChip';

interface AdminConsoleProps {
  tickets: Ticket[];
  onAssign: (ticketNo: string) => void;
  assigned: string[];
}

const STATUS_STYLES: Record<TicketStatus, string> = {
  reported: 'bg-amber-50 text-amber-700 border-amber-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  dispatched: 'bg-sky-50 text-sky-700 border-sky-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function AdminConsole({ tickets, onAssign, assigned }: AdminConsoleProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Reported Tickets</h3>
            <p className="text-sm text-slate-500">{tickets.length} tickets in queue</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Municipal Admin View
          </span>
        </div>

        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:thin]">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 bg-slate-50">
                <th className="px-5 py-3 font-semibold">Ticket ID</th>
                <th className="px-5 py-3 font-semibold">Issue</th>
                <th className="px-5 py-3 font-semibold">Ward</th>
                <th className="px-5 py-3 font-semibold">Location / GPS</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4 font-semibold text-blue-800 whitespace-nowrap">#{t.ticket_no}</td>
                  <td className="px-5 py-4 text-slate-800 whitespace-nowrap">{t.issue}</td>
                  <td className="px-5 py-4 text-slate-600 whitespace-nowrap">{t.ward ?? '—'}</td>
                  <td className="px-5 py-4 min-w-[240px]">
                    <LocationChip
                      locationText={t.location_text}
                      address={t.address}
                      latitude={t.latitude}
                      longitude={t.longitude}
                    />
                    {t.location_text === null && t.address === null && t.latitude === null && (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLES[t.status]}`}
                    >
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {t.status === 'resolved' ? (
                      <span className="text-xs font-medium text-emerald-600">Verified</span>
                    ) : assigned.includes(t.ticket_no) ? (
                      <span className="text-xs font-medium text-blue-600 flex items-center justify-end gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        SMS Sent to Worker
                      </span>
                    ) : (
                      <button
                        onClick={() => onAssign(t.ticket_no)}
                        className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Assign Worker &amp; Send SMS
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    No tickets reported yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
