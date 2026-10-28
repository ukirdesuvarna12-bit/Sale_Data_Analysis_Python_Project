import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Deal, DealStage, SalesRegion, DealSegment, SalesRep } from '../../types/sales';

interface NewDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDeal: (deal: Omit<Deal, 'id'>) => void;
  reps: SalesRep[];
}

export const NewDealModal: React.FC<NewDealModalProps> = ({
  isOpen,
  onClose,
  onAddDeal,
  reps,
}) => {
  const [account, setAccount] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState(250000);
  const [stage, setStage] = useState<DealStage>('qualification');
  const [repId, setRepId] = useState(reps[0]?.id || 'rep_1');
  const [region, setRegion] = useState<SalesRegion>('North America');
  const [segment, setSegment] = useState<DealSegment>('Enterprise');
  const [productLine, setProductLine] = useState('Enterprise Suite');
  const [probability, setProbability] = useState(40);
  const [closeDate, setCloseDate] = useState('2026-11-30');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !title.trim()) return;

    const rep = reps.find((r) => r.id === repId) || reps[0];

    onAddDeal({
      account: account.trim(),
      title: title.trim(),
      value: Number(value),
      stage,
      repId: rep.id,
      repName: rep.name,
      repAvatar: rep.avatar,
      region,
      segment,
      productLine,
      probability: Number(probability),
      closeDate,
      health: 'healthy',
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#121926] border border-slate-800 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div>
            <h3 className="font-semibold text-white text-base">Log New Pipeline Opportunity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Register a qualified deal into the sales pipeline.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Account / Client Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Contract Value ($ USD)</label>
              <input
                type="number"
                required
                min="1000"
                step="5000"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-mono tabular-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Opportunity Scope / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Global Multi-Region Data Mesh"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Pipeline Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="qualification">Qualification</option>
                <option value="discovery">Discovery</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed_won">Closed Won</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Assigned Executive</label>
              <select
                value={repId}
                onChange={(e) => setRepId(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Close Date</label>
              <input
                type="date"
                required
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Product Line</label>
              <select
                value={productLine}
                onChange={(e) => setProductLine(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Enterprise Suite">Enterprise Suite</option>
                <option value="Cloud Scale Node">Cloud Scale Node</option>
                <option value="Data Grid Sync">Data Grid Sync</option>
                <option value="Professional Services">Professional Services</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as SalesRegion)}
                className="w-full bg-[#0b0f17] border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="North America">North America</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
                <option value="LATAM">LATAM</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Win Probability ({probability}%)</label>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Engagement Notes & Next Steps</label>
            <textarea
              rows={2}
              placeholder="Key stakeholder alignment, technical requirements, procurement schedule..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-slate-400 hover:text-slate-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm"
            >
              Create Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
