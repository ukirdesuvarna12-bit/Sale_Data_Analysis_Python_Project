import React, { useState, useMemo } from 'react';
import { SalesOrder, CategorySalesRecord } from '../../types/dashboard';

interface CategoryVerticalBarChartProps {
  data?: SalesOrder[];
  categorySales?: CategorySalesRecord[];
  title?: string;
  subtitle?: string;
}

export const CategoryVerticalBarChart: React.FC<CategoryVerticalBarChartProps> = ({
  data = [],
  categorySales,
  title = 'Sales by Category',
  subtitle = 'Gross revenue breakdown across merchandise categories',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Extract category breakdown from API or raw data
  const stats = useMemo(() => {
    if (categorySales && categorySales.length > 0) {
      const total = categorySales.reduce((s, c) => s + c.Sales, 0);
      return categorySales.map((c) => ({
        category: c.Category,
        sales: c.Sales,
        share: total > 0 ? (c.Sales / total) * 100 : 0,
      })).sort((a, b) => b.sales - a.sales);
    }

    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(d.Category, (map.get(d.Category) || 0) + (Number(d.Sales) || 0));
    });

    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);
    return Array.from(map.entries())
      .map(([cat, sales]) => ({
        category: cat,
        sales,
        share: total > 0 ? (sales / total) * 100 : 0,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [data, categorySales]);

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No category sales records available.</p>
      </div>
    );
  }

  const maxSales = Math.max(...stats.map((s) => s.sales), 1000);
  const yMax = maxSales * 1.2;

  // SVG Chart Dimensions
  const svgWidth = 560;
  const svgHeight = 260;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const numBars = stats.length;
  const slotW = chartW / numBars;
  const barW = Math.min(slotW * 0.52, 64);

  // Y-axis grid lines (4 ticks)
  const yTicks = [
    0,
    yMax * 0.25,
    yMax * 0.5,
    yMax * 0.75,
    yMax,
  ];

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`;
    return `$${Math.round(val)}`;
  };

  const formatFull = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
          <span>Sales ($)</span>
        </div>
      </div>

      {/* SVG Vertical Bar Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((tickVal, i) => {
            const y = padTop + chartH - (tickVal / yMax) * chartH;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke={i === 0 ? '#cbd5e1' : '#f1f5f9'}
                  strokeWidth={i === 0 ? 1.5 : 1}
                  strokeDasharray={i === 0 ? undefined : '3 3'}
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatCurrency(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars */}
          {stats.map((item, idx) => {
            const barH = (item.sales / yMax) * chartH;
            const barX = padLeft + idx * slotW + (slotW - barW) / 2;
            const barY = padTop + chartH - barH;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.category}
                className="cursor-pointer transition-all duration-150"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Hover Background Column Highlight */}
                {isHovered && (
                  <rect
                    x={padLeft + idx * slotW}
                    y={padTop}
                    width={slotW}
                    height={chartH}
                    fill="#f8fafc"
                    rx={6}
                  />
                )}

                {/* Vertical Bar */}
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={Math.max(barH, 4)}
                  rx={4}
                  ry={4}
                  fill={isHovered ? '#1d4ed8' : '#2563eb'}
                  className="transition-colors duration-200"
                />

                {/* Value Label above Bar */}
                <text
                  x={barX + barW / 2}
                  y={barY - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono font-bold transition-colors ${
                    isHovered ? 'fill-blue-700' : 'fill-slate-700'
                  }`}
                >
                  {formatCurrency(item.sales)}
                </text>

                {/* X-axis Category Label */}
                <text
                  x={barX + barW / 2}
                  y={padTop + chartH + 20}
                  textAnchor="middle"
                  className={`text-xs font-medium transition-colors ${
                    isHovered ? 'fill-blue-600 font-semibold' : 'fill-slate-600'
                  }`}
                >
                  {item.category}
                </text>

                {/* Subtitle / Share % below category name */}
                <text
                  x={barX + barW / 2}
                  y={padTop + chartH + 34}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-slate-400"
                >
                  {item.share.toFixed(1)}% share
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
              Sales: {formatFull(stats[hoveredIdx].sales)}
            </div>
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">
              Share: {stats[hoveredIdx].share.toFixed(2)}% of total category sales
            </div>
          </div>
        )}
      </div>

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>X-Axis: Merchandise Category</span>
        <span>Y-Axis: Total Revenue (USD)</span>
      </div>
    </div>
  );
};
