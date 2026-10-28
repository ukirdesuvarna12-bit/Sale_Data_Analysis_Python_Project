import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageId, FilterState, SalesOrder, DashboardApiResponse } from './types/dashboard';
import { initialSalesDataset } from './data/salesDataset';
import { fetchDashboardData, DEFAULT_FLASK_API_URL } from './services/apiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ApiStatusPanel } from './components/ApiStatusPanel';
import { OverviewPage } from './pages/OverviewPage';
import { SalesAnalysisPage } from './pages/SalesAnalysisPage';
import { ProductAnalysisPage } from './pages/ProductAnalysisPage';
import { CustomerAnalysisPage } from './pages/CustomerAnalysisPage';
import { RegionalAnalysisPage } from './pages/RegionalAnalysisPage';
import { DataTablePage } from './pages/DataTablePage';
import { CheckCircle2, AlertCircle, RefreshCw, Server } from 'lucide-react';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('overview');
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_FLASK_API_URL);
  const [apiData, setApiData] = useState<DashboardApiResponse | null>(null);
  const [baseDataset, setBaseDataset] = useState<SalesOrder[]>(initialSalesDataset);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 5 Active Dashboard Filters
  const [filters, setFilters] = useState<FilterState>({
    startDate: '',
    endDate: '',
    category: 'Technology',
    region: 'All',
    product: 'All',
    customer: 'All',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: 'All',
      region: 'All',
      product: 'All',
      customer: 'All',
    });
    showToast('All 5 filters reset to default');
  };

  // Primary data fetching from Python Flask backend API
  const loadDashboardFromApi = useCallback(async (endpoint: string = apiUrl) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const data = await fetchDashboardData(endpoint);
      setApiData(data);
      if (data.records && data.records.length > 0) {
        setBaseDataset(data.records);
      }
      setApiError(null);
      showToast(`Connected to Python Flask API at ${endpoint}`);
    } catch (err: any) {
      console.error('Failed to fetch from Flask API:', err);
      // If server unreachable, retain initial real dataset so dashboard remains active
      setApiError(err.message || 'Unable to connect to Flask backend at http://127.0.0.1:5000/api/dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  // Initial load
  useEffect(() => {
    loadDashboardFromApi(apiUrl);
  }, [loadDashboardFromApi, apiUrl]);

  // Refresh handler
  const handleRefresh = () => {
    loadDashboardFromApi(apiUrl);
  };

  // Update custom API URL
  const handleUpdateApiUrl = (newUrl: string) => {
    setApiUrl(newUrl);
    loadDashboardFromApi(newUrl);
  };

  // Dynamically filter actual dataset based on the 5 filters
  const filteredData = useMemo(() => {
    return baseDataset.filter((order) => {
      // 1. Date Range Filter
      if (filters.startDate && order.Order_Date < filters.startDate) return false;
      if (filters.endDate && order.Order_Date > filters.endDate) return false;

      // 2. Category Filter
      if (filters.category !== 'All' && order.Category !== filters.category) return false;

      // 3. Region Filter
      if (filters.region !== 'All' && order.Region !== filters.region) return false;

      // 4. Product Filter
      if (filters.product !== 'All' && order.Product !== filters.product) return false;

      // 5. Customer Filter
      if (filters.customer !== 'All' && order.Customer_Name !== filters.customer) return false;

      return true;
    });
  }, [baseDataset, filters]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (filteredData.length === 0) return;

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

    const rows = filteredData.map((d) => [
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
      `sales_analytics_export_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filteredData.length} filtered records to CSV`);
  };

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0f172a] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onRefresh={handleRefresh}
        onExportCsv={handleExportCsv}
        isRefreshing={isLoading}
        totalFilteredCount={filteredData.length}
        hasDataset={baseDataset.length > 0}
        isApiConnected={apiData !== null && apiError === null}
        apiUrl={apiUrl}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          totalOrdersCount={filteredData.length}
          isApiConnected={apiData !== null && apiError === null}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            {/* Loading State */}
            {isLoading && !apiData && baseDataset.length === 0 && (
              <div className="min-h-[420px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <div className="relative mb-4">
                  <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <Server className="w-5 h-5 text-blue-600 absolute inset-0 m-auto" />
                </div>
                <h3 className="text-base font-bold text-[#0f172a] tracking-tight">
                  Connecting to Python Flask Backend
                </h3>
                <p className="text-xs text-slate-500 max-w-md mt-1 font-mono">
                  GET {apiUrl}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Fetching KPI values, monthly sales, categories, and ranking metrics...
                </p>
              </div>
            )}

            {/* API Error State (only if no dataset loaded) */}
            {!isLoading && apiError && baseDataset.length === 0 && (
              <ApiStatusPanel
                apiUrl={apiUrl}
                error={apiError}
                onRetry={handleRefresh}
                onUpdateApiUrl={handleUpdateApiUrl}
                isRetrying={isLoading}
              />
            )}

            {/* Active Dashboard Pages */}
            {baseDataset.length > 0 && (
              <>
                {activePage === 'overview' && (
                  <OverviewPage
                    data={filteredData}
                    baseDataset={baseDataset}
                    totalRecordsCount={baseDataset.length}
                    filters={filters}
                    setFilters={setFilters}
                    onResetFilters={handleResetFilters}
                    apiData={apiData}
                  />
                )}

                {activePage === 'sales' && (
                  <SalesAnalysisPage
                    data={filteredData}
                    baseDataset={baseDataset}
                    totalRecordsCount={baseDataset.length}
                    filters={filters}
                    setFilters={setFilters}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activePage === 'product' && (
                  <ProductAnalysisPage
                    data={filteredData}
                    baseDataset={baseDataset}
                    totalRecordsCount={baseDataset.length}
                    filters={filters}
                    setFilters={setFilters}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activePage === 'customer' && (
                  <CustomerAnalysisPage
                    data={filteredData}
                    baseDataset={baseDataset}
                    totalRecordsCount={baseDataset.length}
                    filters={filters}
                    setFilters={setFilters}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activePage === 'regional' && (
                  <RegionalAnalysisPage
                    data={filteredData}
                    baseDataset={baseDataset}
                    totalRecordsCount={baseDataset.length}
                    filters={filters}
                    setFilters={setFilters}
                    onResetFilters={handleResetFilters}
                  />
                )}

                {activePage === 'datatable' && (
                  <DataTablePage
                    data={filteredData}
                    baseDataset={baseDataset}
                    onExportCsv={handleExportCsv}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
