import React, { useMemo } from 'react';
import { SalesOrder } from '../../types/dashboard';

interface SalesVsProfitChartProps {
  data: SalesOrder[];
  groupBy?: 'Category' | 'Product' | 'Region';
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const SalesVsProfitChart: React.FC<SalesVsProfitChartProps> = ({
  data,
  groupBy = 'Category',
  title = 'Sales vs Profit Comparison',
  subtitle = 'Revenue generated versus retained profit margins',
  limit = 8,
}) => {
  const groupedData = useMemo(() => {
    const map = new Map<string, { label: string; sales: number; profit: number }>();

    data.forEach((item) => {
      const key =
        groupBy === 'Category'
          ? item.Category
          : groupBy === 'Region'
          ? item.Region
          : item.Product;
      const existing = map.get(key) || { label: key, sales: 0, profit: 0 };
      existing.sales += Number(item.Sales) || 0;
      existing.profit += Number(item.Profit) || 0;
      map.set(key, existing);
    });

    return Array.from(map.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }, [data, groupBy, limit]);

  if (groupedData.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[260px]">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 mt-1">No comparison data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(...groupedData.map((d) => d.sales), 100);

  const formatCurrency = (val: number) => `$${Math.round(val).toLocaleString()}`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0f172a] tracking-tight">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span>Sales</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            <span>Profit</span>
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        {groupedData.map((item) => {
          const salesWidth = Math.max((item.sales / maxVal) * 100, 4);
          const profitWidth = Math.max((item.profit / maxVal) * 100, 3);
          const margin = item.sales > 0 ? (item.profit / item.sales) * 100 : 0;

          return (
            <div key={item.label} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 truncate pr-2 group-hover:text-blue-600 transition-colors">
                  {item.label}
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-500 tabular-nums">
                  Margin: <strong className="text-emerald-700">{margin.toFixed(1)}%</strong>
                </span>
              </div>

              {/* Dual bar lines */}
              <div className="space-y-1">
                {/* Sales Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${salesWidth}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 w-16 text-right tabular-nums">
                    {formatCurrency(item.sales)}
                  </span>
                </div>

                {/* Profit Bar */}
                <div className="flex items-center gap-2">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profitWidth}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-700 w-16 text-right tabular-nums font-semibold">
                    {formatCurrency(item.profit)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Grouped by: {groupBy}</span>
        <span className="text-slate-600 font-mono">Top {groupedData.length} Entries</span>
      </div>
    </div>
  );
};
