import React, { useState } from 'react';
import { Deal } from '../../types/sales';
import { Sliders, RotateCcw, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ForecastSimulatorProps {
  deals: Deal[];
}

export const ForecastSimulator: React.FC<ForecastSimulatorProps> = ({ deals }) => {
  const [slippagePct, setSlippagePct] = useState(15); // 0 to 40%
  const [winRateDelta, setWinRateDelta] = useState(0); // -15 to +15%
  const [dealSizeMultiplier, setDealSizeMultiplier] = useState(1.0); // 0.8 to 1.4

  const openDeals = deals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost');
  const baseClosedDeals = deals.filter((d) => d.stage === 'closed_won');
  const actualClosedWon = baseClosedDeals.reduce((sum, d) => sum + d.value, 0);

  // Baseline weighted pipeline
  const baseWeighted = openDeals.reduce((sum, d) => {
    return sum + (d.value * (d.probability / 100));
  }, 0);

  // Simulated weighted pipeline
  const nonSlippedPipeline = baseWeighted * (1 - slippagePct / 100);
  const winRateFactor = 1 + (winRateDelta / 100);
  const projectedPipelineWon = nonSlippedPipeline * winRateFactor * dealSizeMultiplier;

  const baselineQ4Target = 1750000;
  const simulatedProjectedQ4 = Math.round(actualClosedWon + projectedPipelineWon);
  const targetGap = simulatedProjectedQ4 - baselineQ4Target;
  const isSurplus = targetGap >= 0;

  const attainmentProbability = Math.min(
    Math.max(Math.round(50 + (targetGap / 40000) - (slippagePct * 0.8) + (winRateDelta * 1.5)), 5),
    99
  );

  const formatCurrency = (val: number) => {
    return `$${Math.abs(val).toLocaleString()}`;
  };

  const handleReset = () => {
    setSlippagePct(15);
    setWinRateDelta(0);
    setDealSizeMultiplier(1.0);
  };

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Executive What-If Scenario Planner</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Dynamic pipeline slippage</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Win-rate sensitivity</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Contract expansion index</span>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Scenario Defaults</span>
        </button>
      </div>

      {/* Main Results Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Projected Revenue */}
        <div className="p-4 rounded-lg bg-[#0b0f17] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Projected Q4 Revenue</span>
          <div className="text-2xl font-bold font-mono text-white tabular-nums mb-1">
            ${simulatedProjectedQ4.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Quota Target:</span>
            <span className="font-mono text-slate-300 tabular-nums">${baselineQ4Target.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Variance to Board Target */}
        <div className="p-4 rounded-lg bg-[#0b0f17] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Board Target Variance</span>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mb-1 flex items-center gap-1.5 ${
              isSurplus ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isSurplus ? '+' : '-'}{formatCurrency(targetGap)}
          </div>
          <div className="text-xs text-slate-400">
            {isSurplus ? 'Surplus buffer over plan' : 'Pacing behind board commitments'}
          </div>
        </div>

        {/* Card 3: Model Confidence */}
        <div className="p-4 rounded-lg bg-[#0b0f17] border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Attainment Confidence Index</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums mb-1">
            {attainmentProbability}%
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                attainmentProbability >= 70
                  ? 'bg-emerald-500'
                  : attainmentProbability >= 45
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${attainmentProbability}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Slider 1: Pipeline Slippage */}
        <div className="space-y-2 bg-[#0b0f17]/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">Pipeline Slippage Risk</span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">{slippagePct}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={slippagePct}
            onChange={(e) => setSlippagePct(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            Deals delayed to the following fiscal year due to legal/procurement cycles.
          </p>
        </div>

        {/* Slider 2: Win Rate Delta */}
        <div className="space-y-2 bg-[#0b0f17]/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">Win Rate Adjustment</span>
            <span
              className={`font-mono font-bold tabular-nums ${
                winRateDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {winRateDelta >= 0 ? `+${winRateDelta}%` : `${winRateDelta}%`}
            </span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            step="1"
            value={winRateDelta}
            onChange={(e) => setWinRateDelta(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            Sensitivity delta against historic competitive benchmark win rates.
          </p>
        </div>

        {/* Slider 3: Deal Size Multiplier */}
        <div className="space-y-2 bg-[#0b0f17]/50 p-4 rounded-lg border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-200">ACV Expansion Multiplier</span>
            <span className="font-mono text-cyan-400 font-bold tabular-nums">
              {dealSizeMultiplier.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={dealSizeMultiplier}
            onChange={(e) => setDealSizeMultiplier(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[11px] text-slate-500 leading-tight">
            Expansion upside driven by multi-year packaging and add-on seats.
          </p>
        </div>
      </div>
    </div>
  );
};
