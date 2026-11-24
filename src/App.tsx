import { useEffect, useState } from 'react';
import {
  Building,
  Map as MapIcon,
  Activity,
  LayoutDashboard,
  Plus,
  Zap,
  TrendingUp,
  Crosshair,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import CivicMap from '@/components/CivicMap';
import ReportModal from '@/components/ReportModal';
import LiveTracker from '@/components/LiveTracker';
import AdminConsole from '@/components/AdminConsole';
import KarmaCard from '@/components/KarmaCard';
import { ensureSeedTicket, useTickets, verifyTicket } from '@/lib/tickets';
import { Ticket } from '@/lib/supabase';
import { REGIONS, districtsFor } from '@/lib/indiaRegions';
import { useGpsTracker } from '@/lib/useGpsTracker';

function matchRegion(name: string | null | undefined): string | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  const exact = REGIONS.find((r) => r.state.toLowerCase() === lower);
  if (exact) return exact.state;
  const partial = REGIONS.find(
    (r) => lower.includes(r.state.toLowerCase()) || r.state.toLowerCase().includes(lower)
  );
  return partial ? partial.state : null;
}

type Tab = 'citizen' | 'tracker' | 'admin';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'citizen', label: 'Citizen Portal', icon: LayoutDashboard },
  { id: 'tracker', label: 'Live Tracker', icon: Activity },
  { id: 'admin', label: 'Admin Console', icon: Building },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('citizen');
  const [state, setState] = useState('Bihar');
  const [district, setDistrict] = useState('Banka');
  const [reportOpen, setReportOpen] = useState(false);
  const [assigned, setAssigned] = useState<string[]>([]);
  const { tickets, refresh } = useTickets();
  const [trackedTicket, setTrackedTicket] = useState<Ticket | null>(null);
  const [verified, setVerified] = useState(false);
  const { gps, startTracking, captureOnce } = useGpsTracker();

  const handlePhotoPicked = () => {
    captureOnce();
  };

  const handleLocationAutoFill = (parts: { state?: string | null; district?: string | null; city?: string | null }) => {
    const matchedState = matchRegion(parts.state);
    if (matchedState && matchedState !== state) {
      setState(matchedState);
      const dists = districtsFor(matchedState);
      const matchedDistrict = parts.district
        ? dists.find((d) => d.toLowerCase().includes(parts.district!.toLowerCase()))
        : undefined;
      setDistrict(matchedDistrict ?? dists[0]);
    } else if (parts.district) {
      const dists = districtsFor(state);
      const matchedDistrict = dists.find((d) => d.toLowerCase().includes(parts.district!.toLowerCase()));
      if (matchedDistrict && matchedDistrict !== district) setDistrict(matchedDistrict);
    }
  };

  useEffect(() => {
    ensureSeedTicket().then(refresh);
  }, []);

  useEffect(() => {
    if (!trackedTicket) return;
    const fresh = tickets.find((t) => t.ticket_no === trackedTicket.ticket_no);
    if (fresh) setTrackedTicket(fresh);
  }, [tickets]);

  const changeState = (next: string) => {
    setState(next);
    setDistrict(districtsFor(next)[0]);
  };

  const handleDispatched = (ticketNo: string) => {
    refresh();
    const fresh = tickets.find((t) => t.ticket_no === ticketNo);
    if (fresh) setTrackedTicket(fresh);
  };

  const handleAssign = (ticketNo: string) => {
    setAssigned((a) => [...a, ticketNo]);
  };

  const handleVerified = async () => {
    const ticketNo = trackedTicket?.ticket_no;
    setVerified(true);
    if (ticketNo) {
      const ok = await verifyTicket(ticketNo);
      if (ok) refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top navigation */}
      <header className="bg-blue-950 text-white sticky top-0 z-40 shadow-lg shadow-blue-950/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Crosshair className="w-5 h-5 text-white" />
            </span>
            <div className="leading-tight">
              <p className="font-bold tracking-tight">NagarPlus</p>
              <p className="text-[10px] uppercase tracking-widest text-blue-200">NagarPulse</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 bg-blue-900/60 rounded-xl p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === id ? 'bg-emerald-500 text-white shadow' : 'text-blue-100 hover:bg-blue-800/70'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {tab === 'citizen' && (
          <>
            {/* Selector row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Citizen Portal</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Report civic hazards and keep your district accountable.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1">State</span>
                  <select
                    value={state}
                    onChange={(e) => changeState(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {REGIONS.map(({ state: s }) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="block text-xs font-medium text-slate-500 mb-1">District</span>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {districtsFor(state).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Building} value="766" label="Districts Covered" />
              <StatCard icon={Zap} value="60%" label="Faster SLA" accent="green" />
              <StatCard icon={TrendingUp} value="96.8%" label="AI Accuracy" />
              <StatCard icon={HeartHandshake} value="4.9" label="Citizen Trust" accent="green" />
            </div>

            {/* Map */}
            <CivicMap />

            {/* CTA */}
            <div className="flex justify-center">
              <button
                onClick={() => setReportOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-all"
              >
                <Plus className="w-6 h-6" />
                Report New Civic Hazard
              </button>
            </div>

            <KarmaCard
              onVerified={handleVerified}
              verified={verified}
              ticketNo={trackedTicket?.ticket_no ?? null}
              gps={gps}
              onPhotoPicked={handlePhotoPicked}
            />
          </>
        )}

        {tab === 'tracker' && (
          <>
            <div>
              <h1 className="text-2xl font-bold">Live Tracker</h1>
              <p className="text-slate-500 text-sm mt-1">
                Real-time progress of your reported civic hazard ticket.
              </p>
            </div>
            <LiveTracker ticket={trackedTicket} />
          </>
        )}

        {tab === 'admin' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Admin Console</h1>
                <p className="text-slate-500 text-sm mt-1">Manage and dispatch reported civic tickets.</p>
              </div>
            </div>
            <AdminConsole tickets={tickets} onAssign={handleAssign} assigned={assigned} />
          </>
        )}

        <footer className="pt-4 pb-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          NagarPlus (NagarPulse) — Civic issue reporting for 766 districts
        </footer>
      </main>

      <ReportModal
        open={reportOpen}
        state={state}
        district={district}
        gps={gps}
        onStartGps={startTracking}
        onPhotoPicked={handlePhotoPicked}
        onLocationAutoFill={handleLocationAutoFill}
        onClose={() => setReportOpen(false)}
        onDispatched={handleDispatched}
      />
    </div>
  );
}
