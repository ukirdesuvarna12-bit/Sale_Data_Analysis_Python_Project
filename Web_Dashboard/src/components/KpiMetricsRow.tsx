import React from 'react';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { Deal } from '../types/sales';

interface KpiMetricsRowProps {
  deals: Deal[];
  timeMultiplier?: number;
}

export const KpiMetricsRow: React.FC<KpiMetricsRowProps> = ({ deals, timeMultiplier = 1 }) => {
  // Compute dynamically based on active deals
  const wonDeals = deals.filter((d) => d.stage === 'closed_won');
  const openDeals = deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost');

  const baseClosedWon = wonDeals.reduce((sum, d) => sum + d.value, 0) || 1210000;
  const pipelineTotal = openDeals.reduce((sum, d) => sum + d.value, 0) || 2895000;
  const weightedPipeline = openDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0) || 1840000;

  // Total annual closed baseline + current period
  const totalARR = Math.round((4985000 + baseClosedWon * 0.2) * timeMultiplier);
  const targetARR = Math.round(4750000 * timeMultiplier);
  const attainmentPct = Math.round((totalARR / targetARR) * 1000) / 10;

  const avgContractValue = deals.length > 0 ? Math.round(deals.reduce((s, d) => s + d.value, 0) / deals.length) : 248000;

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* Metric 1: Net ARR Bookings */}
      <div className="bg-[#121926] border border-slate-800/80 p-4 rounded-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Closed Bookings (ARR)</span>
          <span className="font-mono text-emerald-400 tabular-nums font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +18.4% YoY
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
          {formatCurrency(totalARR)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Target: {formatCurrency(targetARR)}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-emerald-400 font-mono font-medium tabular-nums">{attainmentPct}% to quota</span>
        </div>
        {/* Progress track */}
        <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(attainmentPct, 100)}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Open Pipeline */}
      <div className="bg-[#121926] border border-slate-800/80 p-4 rounded-lg group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Active Pipeline</span>
          <span className="font-mono text-slate-400 tabular-nums">{openDeals.length} active deals</span>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
          {formatCurrency(pipelineTotal)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Weighted Value:</span>
          <span className="font-mono text-indigo-400 font-medium tabular-nums">{formatCurrency(weightedPipeline)}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-slate-500">62% conf</span>
        </div>
        <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full"
            style={{ width: `${Math.min(Math.round((weightedPipeline / pipelineTotal) * 100), 100)}%` }}
          />
        </div>
      </div>

      {/* Metric 3: Average Contract Value (ACV) */}
      <div className="bg-[#121926] border border-slate-800/80 p-4 rounded-lg group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Average Contract Value</span>
          <span className="font-mono text-emerald-400 tabular-nums font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +6.8%
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
          {formatCurrency(avgContractValue)}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Enterprise: $385k</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Growth: $135k</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Cohort median: $210k</span>
          <span className="text-slate-400">Top 10%: $520k</span>
        </div>
      </div>

      {/* Metric 4: Win Rate */}
      <div className="bg-[#121926] border border-slate-800/80 p-4 rounded-lg group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Pipeline Win Rate</span>
          <span className="font-mono text-emerald-400 tabular-nums font-medium flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +3.4 pts
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
          38.2%
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Stage 3+ Win Rate:</span>
          <span className="font-mono text-emerald-400 font-medium tabular-nums">64.5%</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>B2B Avg: 28%</span>
        </div>
        <div className="mt-3 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div className="bg-cyan-500 h-full rounded-full" style={{ width: '38.2%' }} />
        </div>
      </div>

      {/* Metric 5: Sales Cycle Velocity */}
      <div className="bg-[#121926] border border-slate-800/80 p-4 rounded-lg group hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span className="font-medium">Avg Cycle Duration</span>
          <span className="font-mono text-emerald-400 tabular-nums font-medium flex items-center gap-0.5">
            <TrendingDown className="w-3 h-3" />
            -4 Days
          </span>
        </div>
        <div className="text-2xl font-bold font-mono text-white tracking-tight tabular-nums mb-1">
          38 <span className="text-base font-normal text-slate-400">Days</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Discovery: 11d</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Legal: 9d</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Close: 18d</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Velocity Index</span>
          <span className="font-mono text-emerald-400 font-medium tabular-nums">1.24x speedup</span>
        </div>
      </div>
    </div>
  );
};
