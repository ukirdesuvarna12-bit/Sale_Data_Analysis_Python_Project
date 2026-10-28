import React from 'react';
import { SalesOrder, FilterState } from '../types/dashboard';
import { FilterBar } from '../components/FilterBar';
import { LineTrendChart } from '../components/charts/LineTrendChart';
import { CategoryVerticalBarChart } from '../components/charts/CategoryVerticalBarChart';
import { CategoryHorizontalBarChart } from '../components/charts/CategoryHorizontalBarChart';
import { SalesVsProfitChart } from '../components/charts/SalesVsProfitChart';
import { CategoryQuantityBarChart } from '../components/charts/CategoryQuantityBarChart';
import { TrendingUp, AlertCircle, RotateCcw } from 'lucide-react';

interface SalesAnalysisPageProps {
  data: SalesOrder[];
  baseDataset: SalesOrder[];
  totalRecordsCount: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
}

export const SalesAnalysisPage: React.FC<SalesAnalysisPageProps> = ({
  data,
  baseDataset,
  totalRecordsCount,
  filters,
  setFilters,
  onResetFilters,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Sales Analysis</h1>
              <p className="text-xs text-slate-500">
                In-depth revenue velocity, profitability yields, and category merchandise performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Filter Bar: Date, Category, Region, Product */}
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onResetFilters={onResetFilters}
        dataset={baseDataset}
        filteredCount={data.length}
        totalCount={totalRecordsCount}
        hideCustomer={true}
      />

      {/* If filters result in 0 records */}
      {data.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs max-w-lg mx-auto my-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="text-base font-bold text-[#0f172a]">
            No Sales Orders Match Selected Filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            There are no sales orders matching your current date range, category, region, or product selection.
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
        /* Clean Two-Column Responsive Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: Monthly Sales Trend */}
          <LineTrendChart
            data={data}
            metric="Sales"
            title="Monthly Sales Trend"
            subtitle="Gross revenue trajectory across chronological order months"
          />

          {/* Section 2: Monthly Profit Trend */}
          <LineTrendChart
            data={data}
            metric="Profit"
            title="Monthly Profit Trend"
            subtitle="Net profit yield progression and monthly earnings velocity"
          />

          {/* Section 3: Sales by Category */}
          <CategoryVerticalBarChart
            data={data}
            title="Sales by Category"
            subtitle="Gross sales distribution across merchandise categories"
          />

          {/* Section 4: Profit by Category */}
          <CategoryHorizontalBarChart
            data={data}
            title="Profit by Category"
            subtitle="Net profit earnings and profit margins per merchandise segment"
          />

          {/* Section 5: Sales vs Profit */}
          <SalesVsProfitChart
            data={data}
            groupBy="Category"
            title="Sales vs Profit"
            subtitle="Side-by-side revenue volume compared with retained profit margin"
          />

          {/* Section 6: Quantity by Category */}
          <CategoryQuantityBarChart
            data={data}
            title="Quantity by Category"
            subtitle="Physical units fulfilled across merchandise categories"
          />
        </div>
      )}
    </div>
  );
};
