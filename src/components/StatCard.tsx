import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  accent?: 'blue' | 'green';
}

export default function StatCard({ icon: Icon, value, label, accent = 'blue' }: StatCardProps) {
  const accentClasses =
    accent === 'green'
      ? 'bg-emerald-50 text-emerald-600'
      : 'bg-blue-50 text-blue-800';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accentClasses}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
