import React, { useMemo } from 'react';
import { FilterState, SalesOrder } from '../types/dashboard';
import {
  RotateCcw,
  Calendar,
  Layers,
  MapPin,
  Package,
  Users,
  Filter as FilterIcon,
  X,
} from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  dataset: SalesOrder[];
  filteredCount: number;
  totalCount: number;
  hideCustomer?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onResetFilters,
  dataset,
  filteredCount,
  totalCount,
  hideCustomer = false,
}) => {
  // Extract unique sorted options dynamically from the actual dataset
  const categories = useMemo(() => {
    return Array.from(new Set(dataset.map((d) => d.Category).filter(Boolean))).sort();
  }, [dataset]);

  const regions = useMemo(() => {
    return Array.from(new Set(dataset.map((d) => d.Region).filter(Boolean))).sort();
  }, [dataset]);

  const products = useMemo(() => {
    return Array.from(new Set(dataset.map((d) => d.Product).filter(Boolean))).sort();
  }, [dataset]);

  const customers = useMemo(() => {
    return Array.from(new Set(dataset.map((d) => d.Customer_Name).filter(Boolean))).sort();
  }, [dataset]);

  // Compute number of active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.startDate || filters.endDate) count++;
    if (filters.category !== 'All') count++;
    if (filters.region !== 'All') count++;
    if (filters.product !== 'All') count++;
    if (!hideCustomer && filters.customer !== 'All') count++;
    return count;
  }, [filters, hideCustomer]);

  const isFiltered = activeFilterCount > 0;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Side: Filter Title & Inputs */}
        <div className="flex flex-wrap items-center gap-2 text-xs flex-1 min-w-0">
          {/* Filter Header Label */}
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold pr-1 shrink-0">
            <FilterIcon className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Filters</span>
            {isFiltered && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* 1. Date Range Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 transition-colors shrink-0">
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">Date:</span>
            <input
              type="date"
              aria-label="Start date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="bg-transparent text-[11px] font-mono text-slate-700 focus:outline-hidden cursor-pointer"
              title="Filter from date"
            />
            <span className="text-slate-300">-</span>
            <input
              type="date"
              aria-label="End date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="bg-transparent text-[11px] font-mono text-slate-700 focus:outline-hidden cursor-pointer"
              title="Filter to date"
            />
            {(filters.startDate || filters.endDate) && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, startDate: '', endDate: '' }))}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                title="Clear date filter"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* 2. Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 transition-colors max-w-[170px] shrink-0">
            <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className={`bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer truncate w-full ${
                filters.category !== 'All' ? 'text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Region Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 transition-colors max-w-[150px] shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={filters.region}
              onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
              className={`bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer truncate w-full ${
                filters.region !== 'All' ? 'text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <option value="All">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Product Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 transition-colors max-w-[180px] shrink-0">
            <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <select
              value={filters.product}
              onChange={(e) => setFilters((prev) => ({ ...prev, product: e.target.value }))}
              className={`bg-transparent text-xs font-medium focus:outline-hidden truncate cursor-pointer w-full ${
                filters.product !== 'All' ? 'text-blue-700 font-semibold' : 'text-slate-700'
              }`}
            >
              <option value="All">All Products</option>
              {products.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Customer Filter (Optional) */}
          {!hideCustomer && (
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 hover:border-slate-300 transition-colors max-w-[170px] shrink-0">
              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={filters.customer}
                onChange={(e) => setFilters((prev) => ({ ...prev, customer: e.target.value }))}
                className={`bg-transparent text-xs font-medium focus:outline-hidden truncate cursor-pointer w-full ${
                  filters.customer !== 'All' ? 'text-blue-700 font-semibold' : 'text-slate-700'
                }`}
              >
                <option value="All">All Customers</option>
                {customers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters Button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
              title="Reset all filters to default"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Record Counter */}
        <div className="text-[11px] font-mono text-slate-500 whitespace-nowrap self-center">
          <span>Showing </span>
          <strong className="text-slate-800 font-bold tabular-nums">{filteredCount}</strong>
          <span> of </span>
          <strong className="text-slate-800 font-bold tabular-nums">{totalCount}</strong>
          <span> orders</span>
        </div>
      </div>
    </div>
  );
};
