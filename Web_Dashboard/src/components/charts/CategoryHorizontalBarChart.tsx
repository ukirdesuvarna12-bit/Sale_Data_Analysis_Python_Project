import React, { useState, useMemo } from 'react';
import { SalesOrder, CategoryProfitRecord } from '../../types/dashboard';

interface CategoryHorizontalBarChartProps {
  data?: SalesOrder[];
  categoryProfit?: CategoryProfitRecord[];
  title?: string;
  subtitle?: string;
}

export const CategoryHorizontalBarChart: React.FC<CategoryHorizontalBarChartProps> = ({
  data = [],
  categoryProfit,
  title = 'Profit by Category',
  subtitle = 'Net profit yield generated across merchandise categories',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute category profit and sales for margin calculation
  const stats = useMemo(() => {
    if (categoryProfit && categoryProfit.length > 0) {
      // Map API records
      const total = categoryProfit.reduce((s, c) => s + c.Profit, 0);
      return categoryProfit.map((c) => ({
        category: c.Category,
        profit: c.Profit,
        sales: 0,
        margin: 0,
        share: total > 0 ? (c.Profit / total) * 100 : 0,
      })).sort((a, b) => b.profit - a.profit);
    }

    const map = new Map<string, { profit: number; sales: number; count: number }>();
    data.forEach((d) => {
      const cur = map.get(d.Category) || { profit: 0, sales: 0, count: 0 };
      cur.profit += Number(d.Profit) || 0;
      cur.sales += Number(d.Sales) || 0;
      cur.count += 1;
      map.set(d.Category, cur);
    });

    const totalProfit = Array.from(map.values()).reduce((s, v) => s + v.profit, 0);

    return Array.from(map.entries())
      .map(([cat, val]) => ({
        category: cat,
        profit: val.profit,
        sales: val.sales,
        margin: val.sales > 0 ? (val.profit / val.sales) * 100 : 0,
        share: totalProfit > 0 ? (val.profit / totalProfit) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit);
  }, [data, categoryProfit]);

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No category profit records available.</p>
      </div>
    );
  }

  const maxProfit = Math.max(...stats.map((s) => s.profit), 1000);
  const xMax = maxProfit * 1.15;

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${Math.round(val)}`;
  };

  const formatFull = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // SVG Chart Dimensions
  const svgWidth = 560;
  const svgHeight = 260;
  const padLeft = 110;
  const padRight = 45;
  const padTop = 20;
  const padBottom = 35;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const numBars = stats.length;
  const slotH = chartH / numBars;
  const barH = Math.min(slotH * 0.52, 32);

  // X-axis grid lines (4 ticks)
  const xTicks = [
    0,
    xMax * 0.25,
    xMax * 0.5,
    xMax * 0.75,
    xMax,
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
          <span>Profit ($)</span>
        </div>
      </div>

      {/* SVG Horizontal Bar Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Vertical Grid lines & X-axis labels */}
          {xTicks.map((tickVal, i) => {
            const x = padLeft + (tickVal / xMax) * chartW;
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + chartH}
                  stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={i === 0 ? 1.5 : 1}
                  strokeDasharray={i === 0 ? undefined : '3 3'}
                />
                <text
                  x={x}
                  y={padTop + chartH + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatCurrency(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Horizontal Bars */}
          {stats.map((item, idx) => {
            const barW = Math.max((item.profit / xMax) * chartW, 4);
            const barY = padTop + idx * slotH + (slotH - barH) / 2;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.category}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Row Hover Background */}
                {isHovered && (
                  <rect
                    x={padLeft}
                    y={padTop + idx * slotH}
                    width={chartW}
                    height={slotH}
                    fill="#f8fafc"
                    rx={4}
                  />
                )}

                {/* Y-axis Category Label */}
                <text
                  x={padLeft - 12}
                  y={barY + barH / 2 + 4}
                  textAnchor="end"
                  className={`text-xs font-medium transition-colors ${
                    isHovered ? 'fill-emerald-700 font-semibold' : 'fill-slate-700'
                  }`}
                >
                  {item.category}
                </text>

                {/* Horizontal Bar */}
                <rect
                  x={padLeft}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx={4}
                  ry={4}
                  fill={isHovered ? '#059669' : '#10b981'}
                  className="transition-colors duration-200"
                />

                {/* Value Label to Right of Bar */}
                <text
                  x={padLeft + barW + 8}
                  y={barY + barH / 2 + 3.5}
                  textAnchor="start"
                  className={`text-[11px] font-mono font-bold transition-colors ${
                    isHovered ? 'fill-emerald-700' : 'fill-slate-800'
                  }`}
                >
                  {formatCurrency(item.profit)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && stats[hoveredIdx] && (
          <div
            className="absolute top-2 right-2 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-10 font-sans border border-slate-700"
          >
            <div className="font-bold text-slate-100">{stats[hoveredIdx].category}</div>
            <div className="text-emerald-400 font-mono font-bold mt-0.5">
              Net Profit: {formatFull(stats[hoveredIdx].profit)}
            </div>
            {stats[hoveredIdx].margin > 0 && (
              <div className="text-slate-300 text-[10px] font-mono mt-0.5">
                Profit Margin: {stats[hoveredIdx].margin.toFixed(2)}%
              </div>
            )}
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">
              Share: {stats[hoveredIdx].share.toFixed(1)}% of total profit
            </div>
          </div>
        )}
      </div>

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Y-Axis: Merchandise Category</span>
        <span>X-Axis: Net Profit (USD)</span>
      </div>
    </div>
  );
};
