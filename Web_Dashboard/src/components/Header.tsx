import React from 'react';
import {
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
  Server,
  FileSpreadsheet,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  onExportCsv?: () => void;
  onExportXlsx?: () => void;
  isRefreshing: boolean;
  totalFilteredCount?: number;
  hasDataset: boolean;
  isApiConnected?: boolean;
  apiUrl?: string;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onExportCsv,
  onExportXlsx,
  isRefreshing,
  totalFilteredCount = 0,
  hasDataset,
  isApiConnected = false,
  apiUrl = 'http://127.0.0.1:5000/api/dashboard',
  isMobileSidebarOpen = false,
  onToggleMobileSidebar,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <BarChart3 className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Sales Analytics
              </h1>
              {/* Portfolio Project Badge */}
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                Portfolio Project
              </span>
              {/* Flask API Status Badge */}
              <span
                className={`hidden lg:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                  isApiConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
                title={`API Gateway: ${apiUrl}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <Server className="w-3 h-3" />
                <span>{isApiConnected ? 'Backend Live' : 'Backend Offline'}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Executive business performance & predictive merchandise insights
            </p>
          </div>
        </div>

        {/* Right Actions: Date, Refresh, Export */}
        <div className="flex items-center gap-2">
          {/* Current Date Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{todayFormatted}</span>
          </div>

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs active:scale-98 disabled:opacity-60 cursor-pointer"
            title="Refresh sales records from Flask backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Export Excel (.xlsx) if available */}
          {hasDataset && onExportXlsx && (
            <button
              onClick={onExportXlsx}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs active:scale-98 cursor-pointer"
              title="Export records to Excel spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          )}

          {/* Export CSV Button */}
          {hasDataset && onExportCsv && (
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors shadow-xs active:scale-98 cursor-pointer"
              title="Export current filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
