import React, { useState } from 'react';
import { SalesRep, Deal } from '../../types/sales';
import { Award, Mail, Phone, Calendar, ArrowUpRight, TrendingUp, CheckCircle, ShieldCheck } from 'lucide-react';

interface RepLeaderboardProps {
  reps: SalesRep[];
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
}

export const RepLeaderboard: React.FC<RepLeaderboardProps> = ({ reps, deals, onSelectDeal }) => {
  const [selectedRepId, setSelectedRepId] = useState<string>(reps[0]?.id || '');

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;
  const formatM = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  const activeRep = reps.find((r) => r.id === selectedRepId) || reps[0];
  const activeRepDeals = deals.filter((d) => d.repId === activeRep?.id);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white tracking-tight">Sales Team Performance & Quota Pacing</h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
          <span>Individual attainment</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Pipeline generation</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Conversion efficiency</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Rep Performance Cards */}
        <div className="lg:col-span-2 space-y-3">
          {reps.map((rep, idx) => {
            const isAttained = rep.targetAttainmentPct >= 100;
            const isSelected = rep.id === selectedRepId;

            return (
              <div
                key={rep.id}
                onClick={() => setSelectedRepId(rep.id)}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#121926] border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-[#101726]/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  {/* Avatar & Title */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={rep.avatar}
                        alt={rep.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 bg-slate-800 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {idx === 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-[#0b0f17] flex items-center justify-center text-[10px] font-bold shadow">
                          #1
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm hover:text-indigo-400 transition-colors">
                          {rep.name}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">({rep.region})</span>
                      </div>
                      <div className="text-xs text-slate-400">{rep.role}</div>
                    </div>
                  </div>

                  {/* Quota Attainment Badge */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Quota Attainment</div>
                      <div
                        className={`text-lg font-bold font-mono tabular-nums ${
                          isAttained ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {rep.targetAttainmentPct}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#0b0f17] h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isAttained ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(rep.targetAttainmentPct, 100)}%` }}
                  />
                </div>

                {/* Stats Quad */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Closed Won</span>
                    <span className="font-mono font-semibold text-white tabular-nums">
                      {formatCurrency(rep.closedWon)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Active Pipeline</span>
                    <span className="font-mono text-indigo-400 tabular-nums">
                      {formatCurrency(rep.pipelineValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Win Rate</span>
                    <span className="font-mono text-emerald-400 tabular-nums">
                      {rep.winRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Avg Sales Cycle</span>
                    <span className="font-mono text-slate-300 tabular-nums">
                      {rep.avgCycleDays} days
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Rep Deep Dive Panel */}
        {activeRep && (
          <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80 mb-4">
                <img
                  src={activeRep.avatar}
                  alt={activeRep.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50"
                />
                <div>
                  <h3 className="font-bold text-white text-base">{activeRep.name}</h3>
                  <p className="text-xs text-slate-400">{activeRep.role}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{activeRep.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Assigned Pipeline Opportunities ({activeRepDeals.length})
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {activeRepDeals.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => onSelectDeal(d)}
                      className="p-2.5 rounded bg-[#0b0f17] border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                          {d.account}
                        </span>
                        <span className="font-mono font-medium text-emerald-400 tabular-nums">
                          {formatCurrency(d.value)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="capitalize">{d.stage.replace('_', ' ')}</span>
                        <span className="font-mono">{d.probability}% prob</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Compensation & Accelerator Telemetry */}
            <div className="p-3 bg-[#0b0f17] rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400">Accelerator Tier:</span>
                <span className="text-indigo-400 font-semibold font-mono">1.25x Over-Quota</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Earned Commission:</span>
                <span className="font-mono font-bold text-white tabular-nums">
                  ${Math.round(activeRep.closedWon * 0.085).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
