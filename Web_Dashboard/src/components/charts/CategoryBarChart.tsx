import React, { useState, useMemo } from 'react';
import { SalesOrder, CategorySalesRecord, CategoryProfitRecord } from '../../types/dashboard';

interface CategoryBarChartProps {
  data?: SalesOrder[];
  categorySales?: CategorySalesRecord[];
  categoryProfit?: CategoryProfitRecord[];
  metric: 'Sales' | 'Profit' | 'Quantity';
  title?: string;
  subtitle?: string;
  barColor?: string;
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({
  data = [],
  categorySales,
  categoryProfit,
  metric,
  title,
  subtitle,
  barColor,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Group by Category or use direct API category_sales / category_profit
  const categoryStats = useMemo(() => {
    if (metric === 'Sales' && categorySales && categorySales.length > 0) {
      return categorySales.map((item) => ({
        category: item.Category,
        sales: item.Sales,
        profit: 0,
        quantity: 0,
        count: 0,
      })).sort((a, b) => b.sales - a.sales);
    }

    if (metric === 'Profit' && categoryProfit && categoryProfit.length > 0) {
      return categoryProfit.map((item) => ({
        category: item.Category,
        sales: 0,
        profit: item.Profit,
        quantity: 0,
        count: 0,
      })).sort((a, b) => b.profit - a.profit);
    }

    const map = new Map<string, { category: string; sales: number; profit: number; quantity: number; count: number }>();

    data.forEach((item) => {
      const existing = map.get(item.Category) || {
        category: item.Category,
        sales: 0,
        profit: 0,
        quantity: 0,
        count: 0,
      };
      existing.sales += item.Sales;
      existing.profit += item.Profit;
      existing.quantity += item.Quantity;
      existing.count += 1;
      map.set(item.Category, existing);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (metric === 'Sales') return b.sales - a.sales;
      if (metric === 'Profit') return b.profit - a.profit;
      return b.quantity - a.quantity;
    });
  }, [data, categorySales, categoryProfit, metric]);

  const defaultTitle = metric === 'Sales' ? 'Sales by Category' : metric === 'Profit' ? 'Profit by Category' : 'Quantity by Category';
  const defaultSubtitle = `Aggregated ${metric.toLowerCase()} volume per merchandise segment`;

  if (categoryStats.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[260px]">
        <p className="text-sm font-semibold text-slate-700">{title || defaultTitle}</p>
        <p className="text-xs text-slate-400 mt-1">No category data returned by Flask backend.</p>
      </div>
    );
  }

  const values = categoryStats.map((c) => (metric === 'Sales' ? c.sales : metric === 'Profit' ? c.profit : c.quantity));
  const maxVal = Math.max(...values, 10);
  const totalVal = values.reduce((sum, v) => sum + v, 0);

  const formatValue = (val: number) => {
    if (metric === 'Quantity') return `${val.toLocaleString()} units`;
    return `$${Math.round(val).toLocaleString()}`;
  };

  const getBarFill = () => {
    if (barColor) return barColor;
    if (metric === 'Sales') return '#2563eb'; // Blue
    if (metric === 'Profit') return '#10b981'; // Emerald
    return '#f59e0b'; // Amber
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#0f172a] tracking-tight">
          {title || defaultTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle || defaultSubtitle}</p>
      </div>

      <div className="space-y-3.5">
        {categoryStats.map((item) => {
          const val = metric === 'Sales' ? item.sales : metric === 'Profit' ? item.profit : item.quantity;
          const pct = totalVal > 0 ? (val / totalVal) * 100 : 0;
          const widthPct = Math.max((val / maxVal) * 100, 3);
          const isHovered = hoveredCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="group cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0f172a] tabular-nums">
                    {formatValue(val)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums w-12 text-right">
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Bar track */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: getBarFill(),
                    opacity: isHovered ? 1 : 0.88,
                  }}
                />
              </div>

              {/* Subtitle with margin & orders */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5 font-medium">
                {item.count > 0 && <span>{item.count} orders recorded</span>}
                {metric !== 'Profit' && item.profit > 0 && item.sales > 0 && (
                  <span>
                    Margin: {((item.profit / item.sales) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Total Aggregated:</span>
        <span className="font-mono font-bold text-[#0f172a] tabular-nums">
          {formatValue(totalVal)}
        </span>
      </div>
    </div>
  );
};
