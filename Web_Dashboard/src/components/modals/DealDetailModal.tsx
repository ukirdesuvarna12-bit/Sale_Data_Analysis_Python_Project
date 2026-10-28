import React, { useState } from 'react';
import { X, Calendar, User, ShieldAlert, CheckCircle2, Trash2 } from 'lucide-react';
import { Deal, DealStage, DealHealth } from '../../types/sales';

interface DealDetailModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateDeal: (updated: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  deal,
  isOpen,
  onClose,
  onUpdateDeal,
  onDeleteDeal,
}) => {
  if (!isOpen || !deal) return null;

  const [stage, setStage] = useState<DealStage>(deal.stage);
  const [health, setHealth] = useState<DealHealth>(deal.health);
  const [value, setValue] = useState(deal.value);
  const [probability, setProbability] = useState(deal.probability);
  const [closeDate, setCloseDate] = useState(deal.closeDate);
  const [notes, setNotes] = useState(deal.notes || '');

  const handleSave = () => {
    onUpdateDeal({
      ...deal,
      stage,
      health,
      value: Number(value),
      probability: Number(probability),
      closeDate,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#121926] border border-slate-800 rounded-xl max-w-xl w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">{deal.segment} · {deal.region}</span>
            <h3 className="font-semibold text-white text-base leading-snug">{deal.account}</h3>
            <p className="text-xs text-slate-400">{deal.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Key Rep & Value Banner */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b0f17] border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={deal.repAvatar}
                alt={deal.repName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <span className="text-[11px] text-slate-500">Lead Account Executive</span>
                <div className="font-medium text-slate-200">{deal.repName}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-500">Deal Value</span>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                ${value.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Edit Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="qualification">Qualification</option>
                <option value="discovery">Discovery</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
                <option value="closed_lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Deal Health</label>
              <select
                value={health}
                onChange={(e) => setHealth(e.target.value as DealHealth)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="healthy">Healthy (Nominal)</option>
                <option value="at_risk">At Risk</option>
                <option value="stalled">Stalled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Contract Amount ($)</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Expected Close Date</label>
              <input
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Win Probability</span>
              <span className="font-mono text-indigo-400 font-bold tabular-nums">{probability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Opportunity Notes & History</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                onDeleteDeal(deal.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors py-1 px-2 rounded hover:bg-rose-950/30 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Archive Deal</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
