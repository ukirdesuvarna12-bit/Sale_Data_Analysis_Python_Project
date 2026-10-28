import React from 'react';
import { Plus, Download, SlidersHorizontal, Bell, CheckCircle2 } from 'lucide-react';

interface TopNavProps {
  activeTab: 'overview' | 'deals' | 'reps' | 'ledger' | 'forecast';
  setActiveTab: (tab: 'overview' | 'deals' | 'reps' | 'ledger' | 'forecast') => void;
  onOpenNewDealModal: () => void;
  onExportCsv: () => void;
  unreadCount?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewDealModal,
  onExportCsv,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0d131f]/95 backdrop-blur border-b border-slate-800/80 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/20">
            V
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-base font-semibold tracking-tight text-white hover:text-slate-200 transition-colors whitespace-nowrap"
          >
            Vanguard Sales
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'deals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Pipeline & Deals
          </button>
          <button
            onClick={() => setActiveTab('reps')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'reps'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Rep Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'ledger'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Revenue Ledger
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Forecast Simulator
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onExportCsv}
            title="Export filtered sales data to CSV"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewDealModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm shadow-indigo-600/30 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Deal</span>
          </button>
        </div>
      </div>
    </header>
  );
};
