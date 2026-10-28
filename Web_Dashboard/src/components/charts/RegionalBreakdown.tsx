import React from 'react';
import { regionalMetrics } from '../../data/mockSalesData';
import { SalesRegion } from '../../types/sales';
import { TrendingUp, Globe } from 'lucide-react';

interface RegionalBreakdownProps {
  selectedRegion: SalesRegion | 'All';
  onSelectRegion: (r: SalesRegion | 'All') => void;
}

export const RegionalBreakdown: React.FC<RegionalBreakdownProps> = ({
  selectedRegion,
  onSelectRegion,
}) => {
  const formatM = (val: number) => `$${(val / 1000000).toFixed(2)}M`;

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Regional Performance & Attainment</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Territory actuals vs quota target</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>YoY momentum</span>
          </div>
        </div>
        <Globe className="w-4 h-4 text-slate-500" />
      </div>

      <div className="space-y-4">
        {regionalMetrics.map((rm) => {
          const attainment = Math.round((rm.revenue / rm.target) * 1000) / 10;
          const isSelected = selectedRegion === rm.region;

          return (
            <div
              key={rm.region}
              onClick={() => onSelectRegion(isSelected ? 'All' : rm.region)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/60 border-indigo-500/80'
                  : 'bg-[#0b0f17]/60 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{rm.region}</span>
                  <span aria-hidden="true" className="text-slate-700">·</span>
                  <span className="text-slate-400 font-mono tabular-nums">{rm.activeDeals} deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white tabular-nums">
                    {formatM(rm.revenue)}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 tabular-nums flex items-center">
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    +{rm.growthYoY}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#121926] h-1.5 rounded-full overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full ${
                    attainment >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(attainment, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Quota: {formatM(rm.target)}</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {attainment}% Attainment ({rm.sharePct}% global share)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
