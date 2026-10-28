import React from 'react';
import { Deal } from '../../types/sales';

interface PipelineFunnelChartProps {
  deals: Deal[];
  onSelectStage?: (stageKey: string) => void;
}

export const PipelineFunnelChart: React.FC<PipelineFunnelChartProps> = ({ deals, onSelectStage }) => {
  const stages = [
    { key: 'prospecting', label: 'Prospecting', benchmarkConv: 75, avgDays: 6 },
    { key: 'qualification', label: 'Qualification', benchmarkConv: 68, avgDays: 11 },
    { key: 'discovery', label: 'Discovery', benchmarkConv: 62, avgDays: 14 },
    { key: 'proposal', label: 'Proposal', benchmarkConv: 78, avgDays: 12 },
    { key: 'negotiation', label: 'Negotiation', benchmarkConv: 84, avgDays: 9 },
    { key: 'closed_won', label: 'Closed Won', benchmarkConv: 100, avgDays: 0 },
  ];

  // Calculate actual deal sums for each stage
  const stageStats = stages.map((st) => {
    const stageDeals = deals.filter((d) => d.stage === st.key);
    const totalVal = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return {
      ...st,
      count: stageDeals.length,
      value: totalVal,
    };
  });

  const maxVal = Math.max(...stageStats.map((s) => s.value), 1200000);

  const formatK = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${(val / 1000).toFixed(0)}k`;
  };

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Pipeline Velocity & Funnel Conversion</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Stage value</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Historical transition conversion</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Cycle velocity</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {stageStats.map((stage, idx) => {
          const widthPct = Math.max(Math.round((stage.value / maxVal) * 100), 8);
          const isClosedWon = stage.key === 'closed_won';

          return (
            <div
              key={stage.key}
              onClick={() => onSelectStage && onSelectStage(stage.key)}
              className="group cursor-pointer p-2.5 rounded-md hover:bg-slate-800/40 transition-colors"
            >
              {/* Stage Title and Numbers */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 tabular-nums w-4">
                    0{idx + 1}.
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {stage.label}
                  </span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {stage.count} {stage.count === 1 ? 'deal' : 'deals'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-semibold text-white tabular-nums">
                    {formatK(stage.value)}
                  </span>
                  {!isClosedWon && (
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums hidden sm:inline">
                      {stage.benchmarkConv}% step-conv
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar container */}
              <div className="w-full bg-[#0b0f17] h-2 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isClosedWon
                      ? 'bg-emerald-500'
                      : idx >= 3
                      ? 'bg-indigo-500'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>

              {/* Quiet metadata line below bar */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>
                  {stage.avgDays > 0 ? `Avg dwell: ${stage.avgDays} days` : 'Terminal stage'}
                </span>
                <span className="text-slate-400">
                  {stage.count > 0 ? `Avg size: ${formatK(Math.round(stage.value / stage.count))}` : 'No active deals'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Aggregate End-to-End Win Rate: <strong className="text-emerald-400 font-mono font-medium">38.2%</strong></span>
        <span>Median Velocity: <strong className="text-slate-200 font-mono font-medium">38 days</strong></span>
      </div>
    </div>
  );
};
