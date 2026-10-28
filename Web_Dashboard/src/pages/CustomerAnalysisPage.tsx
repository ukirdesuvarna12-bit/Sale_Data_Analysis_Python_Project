import React, { useState, useMemo } from 'react';
import { SalesOrder, FilterState } from '../types/dashboard';
import { FilterBar } from '../components/FilterBar';
import { RankingHorizontalBarChart } from '../components/charts/RankingHorizontalBarChart';
import {
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Table,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface CustomerAnalysisPageProps {
  data: SalesOrder[];
  baseDataset: SalesOrder[];
  totalRecordsCount: number;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
}

type SortField = 'customer' | 'orders' | 'quantity' | 'sales' | 'profit' | 'profitMargin';

interface CustomerAggregated {
  customer: string;
  orders: number;
  quantity: number;
  sales: number;
  profit: number;
  profitMargin: number;
}

export const CustomerAnalysisPage: React.FC<CustomerAnalysisPageProps> = ({
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Group and aggregate actual dataset by Customer_Name
  const customerAggregations = useMemo<CustomerAggregated[]>(() => {
    const map = new Map<string, { customer: string; orders: number; quantity: number; sales: number; profit: number }>();

    data.forEach((item) => {
      const cur = map.get(item.Customer_Name) || {
        customer: item.Customer_Name,
        orders: 0,
        quantity: 0,
        sales: 0,
        profit: 0,
      };
      cur.orders += 1;
      cur.quantity += Number(item.Quantity) || 1;
      cur.sales += Number(item.Sales) || 0;
      cur.profit += Number(item.Profit) || 0;
      map.set(item.Customer_Name, cur);
    });

    return Array.from(map.values()).map((c) => ({
      ...c,
      profitMargin: c.sales > 0 ? (c.profit / c.sales) * 100 : 0,
    }));
  }, [data]);

  // Handle column sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for new field
    }
    setCurrentPage(1);
  };

  // Filtered and Sorted list
  const filteredAndSorted = useMemo(() => {
    return customerAggregations
      .filter((item) => {
        if (!searchTerm) return true;
        return item.customer.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'customer') {
          diff = a.customer.localeCompare(b.customer);
        } else {
          diff = a[sortField] - b[sortField];
        }
        return sortAsc ? diff : -diff;
      });
  }, [customerAggregations, searchTerm, sortField, sortAsc]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

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
              <Users className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Customer Analysis</h1>
              <p className="text-xs text-slate-500">
                Client portfolio breakdown, account rankings, repeat frequency, and net profit contribution
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
            No Customers Match Selected Filters
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
            There are no customer transactions matching your active combination of filters.
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
          {/* Row 1: 1. Top 10 Customers by Sales & 2. Top 10 Customers by Profit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RankingHorizontalBarChart
              data={data}
              groupBy="Customer_Name"
              metric="Sales"
              limit={10}
              title="Top 10 Customers by Sales"
              subtitle="Leading corporate accounts ranked by total purchase volume"
              barColor="#2563eb"
            />

            <RankingHorizontalBarChart
              data={data}
              groupBy="Customer_Name"
              metric="Profit"
              limit={10}
              title="Top 10 Customers by Profit"
              subtitle="Most profitable client accounts by net retained profit"
              barColor="#10b981"
            />
          </div>

          {/* Row 2: 3. Customer Order Count */}
          <div className="grid grid-cols-1 gap-6">
            <RankingHorizontalBarChart
              data={data}
              groupBy="Customer_Name"
              metric="Orders"
              limit={10}
              title="Customer Order Count"
              subtitle="Accounts with the highest repeat transaction engagement"
              barColor="#6366f1"
            />
          </div>

          {/* Section 4: Customer Sales Table with Search, Sorting, and Pagination */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
            {/* Header, Search & Page Size */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
                    Customer Sales Table
                  </h3>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {filteredAndSorted.length} Clients
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Detailed account ledger with transactions, unit volumes, and profit margins
                </p>
              </div>

              {/* Search & Page Size Select */}
              <div className="flex items-center gap-3">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer name..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 focus:outline-hidden cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                    {/* 1. Customer Name */}
                    <th
                      onClick={() => handleSort('customer')}
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/70 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Customer Name</span>
                        {renderSortIcon('customer')}
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
                  {paginatedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                        No client accounts match your search query &quot;{searchTerm}&quot;
                      </td>
                    </tr>
                  ) : (
                    paginatedCustomers.map((item, idx) => {
                      const absoluteIdx = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={item.customer} className="hover:bg-slate-50/70 transition-colors">
                          {/* Customer Name */}
                          <td className="py-2.5 px-4 font-sans font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="w-6 text-slate-400 font-mono text-[11px] font-bold">
                                #{absoluteIdx}
                              </span>
                              <span className="font-semibold text-slate-900">{item.customer}</span>
                            </div>
                          </td>

                          {/* Orders */}
                          <td className="py-2.5 px-4 text-right text-slate-600">
                            {item.orders.toLocaleString()}
                          </td>

                          {/* Quantity */}
                          <td className="py-2.5 px-4 text-right text-slate-700">
                            {item.quantity.toLocaleString()} units
                          </td>

                          {/* Sales */}
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                            {formatCurrency(item.sales)}
                          </td>

                          {/* Profit */}
                          <td
                            className={`py-2.5 px-4 text-right font-bold ${
                              item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {formatCurrency(item.profit)}
                          </td>

                          {/* Profit Margin */}
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls & Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
              <div>
                Showing <span className="font-bold text-slate-800">{paginatedCustomers.length}</span> of{' '}
                <span className="font-bold text-slate-800">{filteredAndSorted.length}</span> customers
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-600"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-[11px] px-2 text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-600"
                    title="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
