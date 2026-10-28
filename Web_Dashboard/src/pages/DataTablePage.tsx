import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../types/dashboard';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Calendar,
  Layers,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

interface DataTablePageProps {
  data: SalesOrder[];
  baseDataset?: SalesOrder[];
  onExportCsv: () => void;
}

type SortField =
  | 'Order_ID'
  | 'Order_Date'
  | 'Customer_Name'
  | 'Category'
  | 'Product'
  | 'Region'
  | 'Quantity'
  | 'Sales'
  | 'Profit';

export const DataTablePage: React.FC<DataTablePageProps> = ({
  data,
  baseDataset,
  onExportCsv,
}) => {
  // Use complete dataset if provided, else current data
  const sourceDataset = baseDataset && baseDataset.length > 0 ? baseDataset : data;

  // Local interactive filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Technology');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Sorting and pagination state
  const [sortField, setSortField] = useState<SortField>('Order_Date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Extract unique options from source dataset
  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceDataset.map((d) => d.Category).filter(Boolean))).sort()];
  }, [sourceDataset]);

  const regions = useMemo(() => {
    return ['All', ...Array.from(new Set(sourceDataset.map((d) => d.Region).filter(Boolean))).sort()];
  }, [sourceDataset]);

  // Handle filter resets
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    selectedRegion !== 'All' ||
    startDate !== '' ||
    endDate !== '';

  // Filtered and Sorted Data
  const processedData = useMemo(() => {
    return sourceDataset
      .filter((item) => {
        // Date filtering
        if (startDate && item.Order_Date < startDate) return false;
        if (endDate && item.Order_Date > endDate) return false;

        // Category filtering
        if (selectedCategory !== 'All' && item.Category !== selectedCategory) return false;

        // Region filtering
        if (selectedRegion !== 'All' && item.Region !== selectedRegion) return false;

        // Search across all text fields
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const match =
            item.Order_ID.toLowerCase().includes(term) ||
            item.Customer_Name.toLowerCase().includes(term) ||
            item.Product.toLowerCase().includes(term) ||
            item.Category.toLowerCase().includes(term) ||
            item.Region.toLowerCase().includes(term) ||
            item.Order_Date.includes(term);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortAsc ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
  }, [sourceDataset, startDate, endDate, selectedCategory, selectedRegion, searchTerm, sortField, sortAsc]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(processedData.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Column Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to desc for new click
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
    );
  };

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Proper Date Formatter (e.g. "Jan 15, 2025")
  const formatDateProperly = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Export filtered data as CSV
  const handleExportCustomCsv = () => {
    if (processedData.length === 0) return;

    const headers = [
      'Order_ID',
      'Order_Date',
      'Customer_Name',
      'Category',
      'Product',
      'Region',
      'Quantity',
      'Sales',
      'Profit',
    ];

    const rows = processedData.map((d) => [
      d.Order_ID,
      d.Order_Date,
      `"${d.Customer_Name.replace(/"/g, '""')}"`,
      `"${d.Category.replace(/"/g, '""')}"`,
      `"${d.Product.replace(/"/g, '""')}"`,
      d.Region,
      d.Quantity,
      d.Sales.toFixed(2),
      d.Profit.toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `sales_dataset_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Complete Sales Dataset</h1>
              <p className="text-xs text-slate-500">
                Full transactional data ledger with multi-column sorting, date & category filtering, and CSV export
              </p>
            </div>
          </div>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={handleExportCustomCsv}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Export CSV ({processedData.length} records)</span>
        </button>
      </div>

      {/* Comprehensive Filtering Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          {/* 1. Real-time Search input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, customer, product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white text-xs transition-colors"
            />
          </div>

          {/* 2. Date filtering, Category filtering, Region filtering, Page size */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Filtering: Start & End */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 focus:outline-hidden cursor-pointer"
                title="Start Date"
              />
              <span className="text-slate-300 text-[10px]">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 focus:outline-hidden cursor-pointer"
                title="End Date"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Categories' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r === 'All' ? 'All Regions' : r}
                  </option>
                ))}
              </select>
            </div>

            {/* Rows Per Page */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
              <span className="text-slate-400 text-xs">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
                title="Reset all table filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Metrics */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
          <span>
            Displaying <strong className="text-slate-700 font-mono">{processedData.length}</strong> of{' '}
            <strong className="text-slate-700 font-mono">{sourceDataset.length}</strong> total records in dataset
          </span>
          <span className="font-mono text-slate-500">
            Sorted by {sortField} ({sortAsc ? 'Ascending' : 'Descending'})
          </span>
        </div>
      </div>

      {/* Main Responsive Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                {/* 1. Order_ID */}
                <th
                  onClick={() => handleSort('Order_ID')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Order_ID</span>
                    {getSortIcon('Order_ID')}
                  </div>
                </th>

                {/* 2. Order_Date */}
                <th
                  onClick={() => handleSort('Order_Date')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Order_Date</span>
                    {getSortIcon('Order_Date')}
                  </div>
                </th>

                {/* 3. Customer_Name */}
                <th
                  onClick={() => handleSort('Customer_Name')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer_Name</span>
                    {getSortIcon('Customer_Name')}
                  </div>
                </th>

                {/* 4. Category */}
                <th
                  onClick={() => handleSort('Category')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Category</span>
                    {getSortIcon('Category')}
                  </div>
                </th>

                {/* 5. Product */}
                <th
                  onClick={() => handleSort('Product')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Product</span>
                    {getSortIcon('Product')}
                  </div>
                </th>

                {/* 6. Region */}
                <th
                  onClick={() => handleSort('Region')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Region</span>
                    {getSortIcon('Region')}
                  </div>
                </th>

                {/* 7. Quantity */}
                <th
                  onClick={() => handleSort('Quantity')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Quantity</span>
                    {getSortIcon('Quantity')}
                  </div>
                </th>

                {/* 8. Sales */}
                <th
                  onClick={() => handleSort('Sales')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Sales</span>
                    {getSortIcon('Sales')}
                  </div>
                </th>

                {/* 9. Profit */}
                <th
                  onClick={() => handleSort('Profit')}
                  className="py-3 px-3.5 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Profit</span>
                    {getSortIcon('Profit')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    No orders match your filter and search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.Order_ID} className="hover:bg-blue-50/40 transition-colors h-[42px]">
                    {/* Order_ID */}
                    <td className="py-2.5 px-3.5 font-mono text-blue-700 font-bold tabular-nums">
                      {row.Order_ID}
                    </td>

                    {/* Order_Date properly formatted */}
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                      {formatDateProperly(row.Order_Date)}
                    </td>

                    {/* Customer_Name */}
                    <td className="py-2.5 px-3 font-medium text-[#0f172a] whitespace-nowrap">
                      {row.Customer_Name}
                    </td>

                    {/* Category with badge */}
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.Category === 'Technology'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : row.Category === 'Office Supplies'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.Category}
                      </span>
                    </td>

                    {/* Product */}
                    <td className="py-2.5 px-3 text-slate-800 truncate max-w-[200px]" title={row.Product}>
                      {row.Product}
                    </td>

                    {/* Region */}
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {row.Region}
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {row.Quantity}
                    </td>

                    {/* Sales formatted as currency */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0f172a] tabular-nums whitespace-nowrap">
                      {formatCurrency(row.Sales)}
                    </td>

                    {/* Profit formatted as currency */}
                    <td
                      className={`py-2.5 px-3.5 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        row.Profit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(row.Profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span>Showing </span>
            <strong className="text-slate-800 font-mono">
              {processedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>
            <span> to </span>
            <strong className="text-slate-800 font-mono">
              {Math.min(currentPage * pageSize, processedData.length)}
            </strong>
            <span> of </span>
            <strong className="text-slate-800 font-mono">{processedData.length}</strong>
            <span> entries</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-slate-600"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2 text-xs font-mono font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-slate-600"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
