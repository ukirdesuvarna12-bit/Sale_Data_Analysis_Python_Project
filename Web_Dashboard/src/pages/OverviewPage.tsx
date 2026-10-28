import React, { useState } from 'react';
import { SalesOrder, FilterState, DashboardApiResponse } from '../types/dashboard';
import { FilterBar } from '../components/FilterBar';
import { KPICards } from '../components/KPICards';
import { LineTrendChart } from '../components/charts/LineTrendChart';
import { CategoryVerticalBarChart } from '../components/charts/CategoryVerticalBarChart';
import { CategoryHorizontalBarChart } from '../components/charts/CategoryHorizontalBarChart';
import { RegionalDonutChart } from '../components/charts/RegionalDonutChart';
import { RankingHorizontalBarChart } from '../components/charts/RankingHorizontalBarChart';
import {
  LayoutDashboard,
  Table,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';

interface OverviewPageProps {
  data: SalesOrder[];
  baseDataset: SalesOrder[];
  totalRecordsCount: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  apiData?: DashboardApiResponse | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  data,
  baseDataset,
  totalRecordsCount,
  filters,
  setFilters,
  onResetFilters,
  apiData,
}) => {
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginatedOrders = data.slice((tablePage - 1) * pageSize, tablePage * pageSize);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: val % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Executive Overview</h1>
              <p className="text-xs text-slate-500">
                Consolidated performance metrics, revenue trajectories, and cross-department telemetry
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Professional Compact Filter Bar at Top of Overview Page */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onResetFilters={onResetFilters}
        dataset={baseDataset}
        filteredCount={data.length}
        totalCount={totalRecordsCount}
      />

      {/* If filters result in 0 records */}
      {data.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">
            No Orders Match Selected Filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            There are no sales orders in the dataset matching your current combination of date range, category, region, product, or customer filters.
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
          {/* 2. Six Executive KPI Cards dynamically updated from filtered dataset */}
          <KPICards data={data} kpis={apiData?.kpis} />

          {/* Row 1: Monthly Sales & Sales by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Sales: Smooth line/area chart */}
            <LineTrendChart
              data={data}
              monthlySales={apiData?.monthly_sales}
              title="Monthly Sales"
              subtitle="Chronological gross revenue trajectory and monthly velocity"
            />

            {/* Sales by Category: Vertical bar chart */}
            <CategoryVerticalBarChart
              data={data}
              categorySales={apiData?.category_sales}
              title="Sales by Category"
              subtitle="Gross revenue breakdown across merchandise categories"
            />
          </div>

          {/* Row 2: Profit by Category & Sales by Region */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profit by Category: Horizontal bar chart */}
            <CategoryHorizontalBarChart
              data={data}
              categoryProfit={apiData?.category_profit}
              title="Profit by Category"
              subtitle="Net profit yield and profitability per merchandise segment"
            />

            {/* Sales by Region: Donut chart */}
            <RegionalDonutChart
              data={data}
              regionSales={apiData?.region_sales}
              title="Sales by Region"
              subtitle="Geographic territory distribution of total revenue"
            />
          </div>

          {/* Row 3: Top 5 Products & Top 5 Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 5 Products: Horizontal bar chart */}
            <RankingHorizontalBarChart
              data={data}
              topProducts={apiData?.top_products}
              groupBy="Product"
              metric="Sales"
              limit={5}
              title="Top 5 Products"
              subtitle="Top revenue generating products in catalogue"
              barColor="#2563eb"
            />

            {/* Top 5 Customers: Horizontal bar chart */}
            <RankingHorizontalBarChart
              data={data}
              topCustomers={apiData?.top_customers}
              groupBy="Customer_Name"
              metric="Sales"
              limit={5}
              title="Top 5 Customers"
              subtitle="Top commercial accounts ranked by total sales volume"
              barColor="#4f46e5"
            />
          </div>

          {/* 3. Filtered Orders Table */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
                    Filtered Orders Table
                  </h3>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {data.length} records
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic transaction ledger matching current filter criteria
                </p>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Page {tablePage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                      disabled={tablePage === 1}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTablePage((p) => Math.min(totalPages, p + 1))}
                      disabled={tablePage === totalPages}
                      className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Region</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Sales</th>
                    <th className="py-2.5 px-3 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {paginatedOrders.map((row) => (
                    <tr key={row.Order_ID} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-800 font-sans">{row.Order_ID}</td>
                      <td className="py-2 px-3 text-slate-500">{row.Order_Date}</td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-700">{row.Customer_Name}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {row.Category}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-700">{row.Product}</td>
                      <td className="py-2 px-3 font-sans">
                        <span className="text-[11px] text-slate-600">{row.Region}</span>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">{row.Quantity}</td>
                      <td className="py-2 px-3 text-right font-bold text-[#0f172a]">
                        {formatCurrency(row.Sales)}
                      </td>
                      <td
                        className={`py-2 px-3 text-right font-bold ${
                          row.Profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(row.Profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
