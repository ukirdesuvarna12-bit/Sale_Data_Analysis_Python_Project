import React, { useState, useMemo } from 'react';
import { SalesOrder, FilterState } from '../types/dashboard';
import { FilterBar } from '../components/FilterBar';
import { RankingHorizontalBarChart } from '../components/charts/RankingHorizontalBarChart';
import { SalesVsProfitChart } from '../components/charts/SalesVsProfitChart';
import {
  Package,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Table,
  RotateCcw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

interface ProductAnalysisPageProps {
  data: SalesOrder[];
  baseDataset: SalesOrder[];
  totalRecordsCount: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
}

type SortField = 'product' | 'sales' | 'profit' | 'quantity' | 'orders' | 'profitMargin';

interface ProductAggregated {
  product: string;
  category: string;
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  profitMargin: number;
}

export const ProductAnalysisPage: React.FC<ProductAnalysisPageProps> = ({
  data,
  baseDataset,
  totalRecordsCount,
  filters,
  setFilters,
  onResetFilters,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('sales');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Group and aggregate actual dataset by Product
  const productAggregations = useMemo<ProductAggregated[]>(() => {
    const map = new Map<string, { product: string; category: string; sales: number; profit: number; quantity: number; orders: number }>();

    data.forEach((item) => {
      const cur = map.get(item.Product) || {
        product: item.Product,
        category: item.Category,
        sales: 0,
        profit: 0,
        quantity: 0,
        orders: 0,
      };
      cur.sales += Number(item.Sales) || 0;
      cur.profit += Number(item.Profit) || 0;
      cur.quantity += Number(item.Quantity) || 1;
      cur.orders += 1;
      map.set(item.Product, cur);
    });

    return Array.from(map.values()).map((p) => ({
      ...p,
      profitMargin: p.sales > 0 ? (p.profit / p.sales) * 100 : 0,
    }));
  }, [data]);

  // Handle sorting click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default desc for newly clicked field
    }
  };

  // Filtered and Sorted table items
  const processedTableItems = useMemo(() => {
    return productAggregations
      .filter((item) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.product.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'product') {
          diff = a.product.localeCompare(b.product);
        } else {
          diff = a[sortField] - b[sortField];
        }
        return sortAsc ? diff : -diff;
      });
  }, [productAggregations, searchTerm, sortField, sortAsc]);

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
              <Package className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Product Analysis</h1>
              <p className="text-xs text-slate-500">
                Item-level performance analytics, profitability rankings, and catalogue unit volume
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
            No Products Match Current Filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            There are no catalogue items matching your active combination of filters.
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
          {/* Row 1: 1. Top 10 Products by Sales & 2. Top 10 Products by Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingHorizontalBarChart
              data={data}
              groupBy="Product"
              metric="Sales"
              limit={10}
              title="Top 10 Products by Sales"
              subtitle="Highest revenue producing catalogue merchandise"
              barColor="#2563eb"
            />

            <RankingHorizontalBarChart
              data={data}
              groupBy="Product"
              metric="Profit"
              limit={10}
              title="Top 10 Products by Profit"
              subtitle="Most profitable items ranked by net earnings"
              barColor="#10b981"
            />
          </div>

          {/* Row 2: 3. Product Quantity & 4. Product Sales vs Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingHorizontalBarChart
              data={data}
              groupBy="Product"
              metric="Quantity"
              limit={10}
              title="Product Quantity"
              subtitle="Physical units fulfilled per catalogue item"
              barColor="#f59e0b"
            />

            <SalesVsProfitChart
              data={data}
              groupBy="Product"
              limit={10}
              title="Product Sales vs Profit"
              subtitle="Comparative revenue generation versus net retained profit"
            />
          </div>

          {/* Section 5: Product Performance Table with Search and Sorting */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            {/* Table Header & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
                    Product Performance Table
                  </h3>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {processedTableItems.length} Products
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated telemetry across all catalogue items using actual calculated dataset
                </p>
              </div>

              {/* Real-time Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Performance Data Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                    {/* 1. Product */}
                    <th
                      onClick={() => handleSort('product')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Product</span>
                        {renderSortIcon('product')}
                      </div>
                    </th>

                    {/* 2. Sales */}
                    <th
                      onClick={() => handleSort('sales')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Sales</span>
                        {renderSortIcon('sales')}
                      </div>
                    </th>

                    {/* 3. Profit */}
                    <th
                      onClick={() => handleSort('profit')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Profit</span>
                        {renderSortIcon('profit')}
                      </div>
                    </th>

                    {/* 4. Quantity */}
                    <th
                      onClick={() => handleSort('quantity')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Quantity</span>
                        {renderSortIcon('quantity')}
                      </div>
                    </th>

                    {/* 5. Orders */}
                    <th
                      onClick={() => handleSort('orders')}
                      className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Orders</span>
                        {renderSortIcon('orders')}
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
                  {processedTableItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        No products match your search query &quot;{searchTerm}&quot;
                      </td>
                    </tr>
                  ) : (
                    processedTableItems.map((item, idx) => (
                      <tr key={item.product} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Column */}
                        <td className="py-2.5 px-4 font-sans font-medium text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-slate-400 font-mono text-[11px] font-bold">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="font-semibold text-slate-900">{item.product}</div>
                              <span className="text-[10px] font-normal text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Sales Column */}
                        <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                          {formatCurrency(item.sales)}
                        </td>

                        {/* Profit Column */}
                        <td
                          className={`py-2.5 px-4 text-right font-bold ${
                            item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {formatCurrency(item.profit)}
                        </td>

                        {/* Quantity Column */}
                        <td className="py-2.5 px-4 text-right text-slate-700">
                          {item.quantity.toLocaleString()} units
                        </td>

                        {/* Orders Column */}
                        <td className="py-2.5 px-4 text-right text-slate-600">
                          {item.orders.toLocaleString()}
                        </td>

                        {/* Profit Margin Column */}
                        <td className="py-2.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                              item.profitMargin >= 5
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : item.profitMargin >= 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {item.profitMargin.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Summary Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span>Showing {processedTableItems.length} products aggregated from filtered transactions</span>
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
