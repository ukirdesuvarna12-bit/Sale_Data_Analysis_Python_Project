import React, { useState, useMemo } from 'react';
import { SalesOrder, FilterState } from '../types/dashboard';
import { FilterBar } from '../components/FilterBar';
import { RegionalDonutChart } from '../components/charts/RegionalDonutChart';
import { RegionMetricBarChart } from '../components/charts/RegionMetricBarChart';
import { SalesVsProfitChart } from '../components/charts/SalesVsProfitChart';
import {
  MapPin,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface RegionalAnalysisPageProps {
  data: SalesOrder[];
  baseDataset: SalesOrder[];
  totalRecordsCount: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
}

type SortField = 'region' | 'orders' | 'quantity' | 'sales' | 'profit' | 'profitMargin';

interface RegionAggregated {
  region: string;
  orders: number;
  quantity: number;
  sales: number;
  profit: number;
  profitMargin: number;
}

export const RegionalAnalysisPage: React.FC<RegionalAnalysisPageProps> = ({
  data,
  baseDataset,
  totalRecordsCount,
  filters,
  setFilters,
  onResetFilters,
}) => {
  const [sortField, setSortField] = useState<SortField>('sales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Region aggregated scorecard
  const regionalSummary = useMemo<RegionAggregated[]>(() => {
    const map = new Map<string, {
      region: string;
      orders: number;
      quantity: number;
      sales: number;
      profit: number;
    }>();

    data.forEach((item) => {
      const cur = map.get(item.Region) || {
        region: item.Region,
        orders: 0,
        quantity: 0,
        sales: 0,
        profit: 0,
      };

      cur.orders += 1;
      cur.quantity += Number(item.Quantity) || 1;
      cur.sales += Number(item.Sales) || 0;
      cur.profit += Number(item.Profit) || 0;
      map.set(item.Region, cur);
    });

    return Array.from(map.values()).map((r) => ({
      ...r,
      profitMargin: r.sales > 0 ? (r.profit / r.sales) * 100 : 0,
    }));
  }, [data]);

  // Handle table sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedRegions = useMemo(() => {
    return [...regionalSummary].sort((a, b) => {
      let diff = 0;
      if (sortField === 'region') {
        diff = a.region.localeCompare(b.region);
      } else {
        diff = a[sortField] - b[sortField];
      }
      return sortAsc ? diff : -diff;
    });
  }, [regionalSummary, sortField, sortAsc]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Regional Analysis</h1>
              <p className="text-xs text-slate-500">
                Geographic market penetration, territorial gross revenue, and bottom-line margin benchmarks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Filter Bar */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onResetFilters={onResetFilters}
        dataset={baseDataset}
        filteredCount={data.length}
        totalCount={totalRecordsCount}
      />

      {data.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">
            No Regional Data Matches Filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            There are no sales orders in this territory matching your active filter criteria.
          </p>
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <>
          {/* Row 1: 1. Sales by Region & 2. Profit by Region */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Sales by Region (Donut Chart) */}
            <RegionalDonutChart
              data={data}
              title="Sales by Region"
              subtitle="Geographic territory distribution of total revenue"
            />

            {/* 2. Profit by Region (Horizontal Bar Chart) */}
            <RegionMetricBarChart
              data={data}
              metric="Profit"
              title="Profit by Region"
              subtitle="Net retained earnings generated by sales territory"
            />
          </div>

          {/* Row 2: 3. Quantity by Region & 4. Sales vs Profit by Region */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Quantity by Region (Horizontal Bar Chart) */}
            <RegionMetricBarChart
              data={data}
              metric="Quantity"
              title="Quantity by Region"
              subtitle="Physical units shipped and fulfilled across territories"
            />

            {/* 4. Sales vs Profit by Region (Dual Comparison Chart) */}
            <SalesVsProfitChart
              data={data}
              groupBy="Region"
              title="Sales vs Profit by Region"
              subtitle="Territorial revenue volume compared with net operating profit"
            />
          </div>

          {/* Section 5: Regional Performance Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
                    Regional Performance Table
                  </h3>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {sortedRegions.length} Territories
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete geographical ledger with orders, quantity, sales, profit, and margin yields
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                    {/* 1. Region */}
                    <th
                      onClick={() => handleSort('region')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Region</span>
                        {renderSortIcon('region')}
                      </div>
                    </th>

                    {/* 2. Orders */}
                    <th
                      onClick={() => handleSort('orders')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Orders</span>
                        {renderSortIcon('orders')}
                      </div>
                    </th>

                    {/* 3. Quantity */}
                    <th
                      onClick={() => handleSort('quantity')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Quantity</span>
                        {renderSortIcon('quantity')}
                      </div>
                    </th>

                    {/* 4. Sales */}
                    <th
                      onClick={() => handleSort('sales')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Sales</span>
                        {renderSortIcon('sales')}
                      </div>
                    </th>

                    {/* 5. Profit */}
                    <th
                      onClick={() => handleSort('profit')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Profit</span>
                        {renderSortIcon('profit')}
                      </div>
                    </th>

                    {/* 6. Profit Margin */}
                    <th
                      onClick={() => handleSort('profitMargin')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Profit Margin</span>
                        {renderSortIcon('profitMargin')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {sortedRegions.map((r, idx) => (
                    <tr key={r.region} className="hover:bg-slate-50/70 transition-colors">
                      {/* Region Column */}
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-slate-400 font-mono text-[11px] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900">{r.region} Region</span>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="py-2.5 px-4 text-right text-slate-600">
                        {r.orders.toLocaleString()}
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-4 text-right text-slate-700">
                        {r.quantity.toLocaleString()} units
                      </td>

                      {/* Sales */}
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(r.sales)}
                      </td>

                      {/* Profit */}
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          r.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(r.profit)}
                      </td>

                      {/* Profit Margin */}
                      <td className="py-2.5 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            r.profitMargin >= 5
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : r.profitMargin >= 0
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {r.profitMargin.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>All 4 operational sales territories evaluated</span>
              <span className="font-mono text-[11px] text-slate-500">
                Sorted by {sortField.toUpperCase()} ({sortAsc ? 'ASC' : 'DESC'})
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
