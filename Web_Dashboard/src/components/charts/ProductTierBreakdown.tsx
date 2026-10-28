import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

export const ProductTierBreakdown: React.FC = () => {
  const tiers = [
    { name: 'Enterprise Suite', revenue: 2890000, percentage: 58.0, color: 'bg-indigo-500', dealsCount: 14, margin: '88%' },
    { name: 'Cloud Scale Node', revenue: 1180000, percentage: 23.7, color: 'bg-cyan-500', dealsCount: 8, margin: '82%' },
    { name: 'Data Grid Sync', revenue: 650000, percentage: 13.0, color: 'bg-emerald-500', dealsCount: 6, margin: '76%' },
    { name: 'Professional Services', revenue: 265000, percentage: 5.3, color: 'bg-purple-500', dealsCount: 5, margin: '42%' },
  ];

  const formatM = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Product Line Revenue Contribution</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Bookings distribution</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Gross margin profile</span>
          </div>
        </div>
        <Layers className="w-4 h-4 text-slate-500" />
      </div>

      {/* Stacked Multi-Color Bar */}
      <div className="w-full h-3 rounded-md overflow-hidden flex bg-slate-900 mb-4">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`${t.color} h-full transition-all duration-300 hover:opacity-90`}
            style={{ width: `${t.percentage}%` }}
            title={`${t.name}: ${t.percentage}%`}
          />
        ))}
      </div>

      <div className="space-y-3">
        {tiers.map((t) => (
          <div key={t.name} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-b-0">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-sm ${t.color}`} />
              <span className="font-medium text-slate-200">{t.name}</span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="text-slate-400 font-mono tabular-nums">{t.dealsCount} deals</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-slate-400 tabular-nums text-[11px]">
                {t.margin} GM
              </span>
              <span className="font-mono font-semibold text-white tabular-nums">
                {formatM(t.revenue)}
              </span>
              <span className="font-mono text-slate-400 tabular-nums w-12 text-right">
                {t.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
