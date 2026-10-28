import React, { useState, useMemo } from 'react';
import { SalesOrder, TopProductRecord, TopCustomerRecord } from '../../types/dashboard';

interface RankingHorizontalBarChartProps {
  data?: SalesOrder[];
  topProducts?: TopProductRecord[];
  topCustomers?: TopCustomerRecord[];
  groupBy: 'Product' | 'Customer_Name';
  metric?: 'Sales' | 'Profit' | 'Quantity' | 'Orders';
  limit?: number;
  title: string;
  subtitle?: string;
  barColor?: string;
}

export const RankingHorizontalBarChart: React.FC<RankingHorizontalBarChartProps> = ({
  data = [],
  topProducts,
  topCustomers,
  groupBy,
  metric = 'Sales',
  limit = 5,
  title,
  subtitle,
  barColor = '#2563eb',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Extract Top items according to requested metric
  const rankedItems = useMemo(() => {
    // If Flask API passed top_products and metric is Sales
    if (metric === 'Sales' && groupBy === 'Product' && topProducts && topProducts.length > 0) {
      const topList = topProducts.slice(0, limit);
      const total = topList.reduce((s, p) => s + p.Sales, 0);
      return topList.map((p) => ({
        name: p.Product,
        val: p.Sales,
        orders: 1,
        share: total > 0 ? (p.Sales / total) * 100 : 0,
      }));
    }

    // If Flask API passed top_customers and metric is Sales
    if (metric === 'Sales' && groupBy === 'Customer_Name' && topCustomers && topCustomers.length > 0) {
      const topList = topCustomers.slice(0, limit);
      const total = topList.reduce((s, c) => s + c.Sales, 0);
      return topList.map((c) => ({
        name: c.Customer_Name,
        val: c.Sales,
        orders: 1,
        share: total > 0 ? (c.Sales / total) * 100 : 0,
      }));
    }

    const map = new Map<string, { name: string; sales: number; profit: number; quantity: number; orders: number }>();
    data.forEach((item) => {
      const key = groupBy === 'Product' ? item.Product : item.Customer_Name;
      const cur = map.get(key) || { name: key, sales: 0, profit: 0, quantity: 0, orders: 0 };
      cur.sales += Number(item.Sales) || 0;
      cur.profit += Number(item.Profit) || 0;
      cur.quantity += Number(item.Quantity) || 1;
      cur.orders += 1;
      map.set(key, cur);
    });

    const list = Array.from(map.values());

    // Sort by requested metric
    list.sort((a, b) => {
      if (metric === 'Profit') return b.profit - a.profit;
      if (metric === 'Quantity') return b.quantity - a.quantity;
      if (metric === 'Orders') return b.orders - a.orders;
      return b.sales - a.sales;
    });

    const sliced = list.slice(0, limit);
    const totalVal = sliced.reduce((s, x) => {
      if (metric === 'Profit') return s + x.profit;
      if (metric === 'Quantity') return s + x.quantity;
      if (metric === 'Orders') return s + x.orders;
      return s + x.sales;
    }, 0);

    return sliced.map((item) => {
      const val =
        metric === 'Profit'
          ? item.profit
          : metric === 'Quantity'
          ? item.quantity
          : metric === 'Orders'
          ? item.orders
          : item.sales;

      return {
        name: item.name,
        val,
        orders: item.orders,
        share: totalVal > 0 ? (val / totalVal) * 100 : 0,
      };
    });
  }, [data, topProducts, topCustomers, groupBy, metric, limit]);

  if (rankedItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No ranking data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(...rankedItems.map((r) => r.val), 10);

  const formatDisplay = (val: number) => {
    if (metric === 'Quantity') return `${val.toLocaleString()} units`;
    if (metric === 'Orders') return `${val} orders`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${Math.round(val)}`;
  };

  const formatFull = (val: number) => {
    if (metric === 'Quantity') return `${val.toLocaleString()} units`;
    if (metric === 'Orders') return `${val} orders`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-mono text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
          Ranked 1 - {rankedItems.length}
        </span>
      </div>

      {/* Horizontal Bar Rows */}
      <div className="space-y-3.5 my-auto">
        {rankedItems.map((item, idx) => {
          const widthPct = Math.max((item.val / maxVal) * 100, 3);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group cursor-pointer"
            >
              {/* Row Label & Values */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`w-4 h-4 rounded text-center font-mono font-bold text-[10px] flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-800'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : idx === 2
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`font-semibold transition-colors truncate ${
                      isHovered ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-[#0f172a] tabular-nums">
                    {formatDisplay(item.val)}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums w-12 text-right">
                    {item.share.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Horizontal Bar Track */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: isHovered ? '#1d4ed8' : barColor,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && rankedItems[hoveredIdx] && (
        <div
          className="absolute top-2 right-2 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-10 font-sans border border-slate-700"
        >
          <div className="font-bold text-slate-100">
            #{hoveredIdx + 1} {rankedItems[hoveredIdx].name}
          </div>
          <div
            className={`font-mono font-bold mt-0.5 ${
              metric === 'Profit'
                ? 'text-emerald-400'
                : metric === 'Quantity'
                ? 'text-amber-400'
                : 'text-blue-400'
            }`}
          >
            {metric}: {formatFull(rankedItems[hoveredIdx].val)}
          </div>
          <div className="text-slate-400 text-[10px] font-mono mt-0.5">
            Share: {rankedItems[hoveredIdx].share.toFixed(1)}% of Top {rankedItems.length} total
          </div>
        </div>
      )}

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Y-Axis: {groupBy === 'Product' ? 'Product Name' : 'Customer Account'}</span>
        <span>X-Axis: Total {metric}</span>
      </div>
    </div>
  );
};
