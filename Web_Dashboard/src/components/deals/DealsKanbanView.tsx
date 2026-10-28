import React from 'react';
import { Deal, DealStage } from '../../types/sales';
import { ChevronRight, Calendar, AlertCircle, Clock, CheckCircle2, User } from 'lucide-react';

interface DealsKanbanViewProps {
  deals: Deal[];
  onSelectDeal: (deal: Deal) => void;
  onAdvanceStage: (dealId: string, e: React.MouseEvent) => void;
}

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'qualification', label: 'Qualification' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed_won', label: 'Closed Won' },
];

export const DealsKanbanView: React.FC<DealsKanbanViewProps> = ({
  deals,
  onSelectDeal,
  onAdvanceStage,
}) => {
  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  const getHealthBadge = (health: Deal['health']) => {
    switch (health) {
      case 'healthy':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Nominal
          </span>
        );
      case 'at_risk':
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            At Risk
          </span>
        );
      case 'stalled':
        return (
          <span className="flex items-center gap-1 text-[11px] text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Stalled
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Active Pipeline Matrix</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Opportunity tracking</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Single-click stage progression</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Risk monitoring</span>
          </div>
        </div>
      </div>

      {/* 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.key);
          const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div
              key={stage.key}
              className="bg-[#101726]/80 border border-slate-800/80 rounded-lg flex flex-col min-h-[580px]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-800/80 bg-[#121926] rounded-t-lg">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">{stage.label}</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="font-mono font-bold text-white text-sm tabular-nums">
                  {formatCurrency(totalValue)}
                </div>
              </div>

              {/* Deals Container */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[640px]">
                {stageDeals.length === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3 text-slate-500 border border-dashed border-slate-800/60 rounded-md">
                    <span className="text-xs">No active opportunities in this stage</span>
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const isClosedWon = deal.stage === 'closed_won';

                    return (
                      <div
                        key={deal.id}
                        onClick={() => onSelectDeal(deal)}
                        className="bg-[#0b0f17] border border-slate-800/80 hover:border-indigo-500/70 p-3 rounded-lg cursor-pointer transition-all duration-150 group shadow-sm"
                      >
                        {/* Account Name & Value */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-semibold text-white text-xs group-hover:text-indigo-400 transition-colors leading-tight">
                            {deal.account}
                          </span>
                          <span className="font-mono font-bold text-slate-100 text-xs tabular-nums whitespace-nowrap">
                            {formatCurrency(deal.value)}
                          </span>
                        </div>

                        {/* Deal Title */}
                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                          {deal.title}
                        </p>

                        {/* Probability Progress Bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span>Win Probability</span>
                            <span className="font-mono text-slate-300 tabular-nums">{deal.probability}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deal.probability >= 70
                                  ? 'bg-emerald-500'
                                  : deal.probability >= 40
                                  ? 'bg-indigo-500'
                                  : 'bg-cyan-500'
                              }`}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>

                        {/* Metadata line with Rep Avatar and Close Date */}
                        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-900/80">
                          {/* Rep with photo avatar */}
                          <div className="flex items-center gap-1.5" title={deal.repName}>
                            <img
                              src={deal.repAvatar}
                              alt={deal.repName}
                              referrerPolicy="no-referrer"
                              className="w-4 h-4 rounded-full object-cover border border-slate-700 bg-slate-800"
                              onError={(e) => {
                                // Graceful avatar fallback
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="text-slate-400 truncate max-w-[80px]">
                              {deal.repName.split(' ')[0]}
                            </span>
                          </div>

                          {/* Health state */}
                          <div>{getHealthBadge(deal.health)}</div>
                        </div>

                        {/* Footer: Close Date & Advance Action */}
                        <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono tabular-nums">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {deal.closeDate}
                          </span>

                          {!isClosedWon && (
                            <button
                              onClick={(e) => onAdvanceStage(deal.id, e)}
                              title="Advance deal to next stage"
                              className="inline-flex items-center gap-0.5 text-indigo-400 hover:text-indigo-300 font-medium py-0.5 px-1.5 rounded hover:bg-indigo-950/40 transition-colors"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
