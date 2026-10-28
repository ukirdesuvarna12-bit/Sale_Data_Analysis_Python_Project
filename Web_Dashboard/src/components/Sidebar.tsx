import React from 'react';
import { PageId } from '../types/dashboard';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Users,
  MapPin,
  Table,
  CheckCircle2,
  Database,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  totalOrdersCount: number;
  isApiConnected?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  totalOrdersCount,
  isApiConnected = false,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }>; count?: string }[] = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Analysis', icon: TrendingUp },
    { id: 'product', label: 'Product Analysis', icon: Package },
    { id: 'customer', label: 'Customer Analysis', icon: Users },
    { id: 'regional', label: 'Regional Analysis', icon: MapPin },
    { id: 'datatable', label: 'Complete Data Table', icon: Table, count: `${totalOrdersCount}` },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      {/* Navigation Section */}
      <div className="space-y-4">
        {/* Section Heading */}
        <div className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Analytics Modules
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1" aria-label="Dashboard navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-3 border-blue-600 rounded-l-none'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-blue-600 stroke-[2.2]' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Information Card: Python Architecture & Portfolio */}
      <div className="space-y-2 pt-3">
        {/* Backend Connectivity Status */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/90 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Python Flask API</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="text-[10px] font-mono text-slate-500 truncate" title="http://127.0.0.1:5000/api/dashboard">
            http://127.0.0.1:5000
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Live Orders:</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">
              {totalOrdersCount}
            </span>
          </div>
        </div>

        {/* Analyst Portfolio Attribution */}
        <div className="px-2 py-1 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Data Analyst Portfolio</span>
          <span className="font-mono">v2.4</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col shrink-0 min-h-[calc(100vh-57px)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white z-50 shadow-2xl md:hidden transition-transform duration-200 ease-out flex flex-col ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              DA
            </div>
            <span className="font-bold text-sm text-slate-900">Analytics Views</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
      </aside>
    </>
  );
};
