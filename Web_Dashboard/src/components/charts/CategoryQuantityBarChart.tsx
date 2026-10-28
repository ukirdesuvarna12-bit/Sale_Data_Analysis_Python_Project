import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../../types/dashboard';

interface CategoryQuantityBarChartProps {
  data?: SalesOrder[];
  title?: string;
  subtitle?: string;
}

export const CategoryQuantityBarChart: React.FC<CategoryQuantityBarChartProps> = ({
  data = [],
  title = 'Quantity by Category',
  subtitle = 'Total volume of physical units fulfilled per category',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Extract quantity by category
  const stats = useMemo(() => {
    const map = new Map<string, { qty: number; orders: number }>();
    data.forEach((d) => {
      const cur = map.get(d.Category) || { qty: 0, orders: 0 };
      cur.qty += Number(d.Quantity) || 1;
      cur.orders += 1;
      map.set(d.Category, cur);
    });

    const totalQty = Array.from(map.values()).reduce((s, v) => s + v.qty, 0);

    return Array.from(map.entries())
      .map(([cat, val]) => ({
        category: cat,
        qty: val.qty,
        orders: val.orders,
        share: totalQty > 0 ? (val.qty / totalQty) * 100 : 0,
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [data]);

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No category quantity data available.</p>
      </div>
    );
  }

  const maxQty = Math.max(...stats.map((s) => s.qty), 10);
  const xMax = maxQty * 1.15;

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

  const xTicks = [
    0,
    Math.round(xMax * 0.25),
    Math.round(xMax * 0.5),
    Math.round(xMax * 0.75),
    Math.round(xMax),
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
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
          <span>Units (Qty)</span>
        </div>
      </div>

      {/* SVG Horizontal Bar Chart for Quantity */}
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
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Horizontal Bars */}
          {stats.map((item, idx) => {
            const barW = Math.max((item.qty / xMax) * chartW, 4);
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
                    fill="#fef3c7"
                    opacity={0.3}
                    rx={4}
                  />
                )}

                {/* Y-axis Category Label */}
                <text
                  x={padLeft - 12}
                  y={barY + barH / 2 + 4}
                  textAnchor="end"
                  className={`text-xs font-medium transition-colors ${
                    isHovered ? 'fill-amber-800 font-semibold' : 'fill-slate-700'
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
                  fill={isHovered ? '#d97706' : '#f59e0b'}
                  className="transition-colors duration-200"
                />

                {/* Value Label to Right of Bar */}
                <text
                  x={padLeft + barW + 8}
                  y={barY + barH / 2 + 3.5}
                  textAnchor="start"
                  className={`text-[11px] font-mono font-bold transition-colors ${
                    isHovered ? 'fill-amber-800' : 'fill-slate-800'
                  }`}
                >
                  {item.qty.toLocaleString()} units
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
            <div className="text-amber-400 font-mono font-bold mt-0.5">
              Physical Units: {stats[hoveredIdx].qty.toLocaleString()} units
            </div>
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">
              Share: {stats[hoveredIdx].share.toFixed(1)}% of total shipped units ({stats[hoveredIdx].orders} orders)
            </div>
          </div>
        )}
      </div>

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Y-Axis: Merchandise Category</span>
        <span>X-Axis: Quantity of Units Sold</span>
      </div>
    </div>
  );
};
