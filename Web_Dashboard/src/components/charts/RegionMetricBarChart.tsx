import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../../types/dashboard';

interface RegionMetricBarChartProps {
  data: SalesOrder[];
  metric: 'Profit' | 'Quantity';
  title: string;
  subtitle: string;
}

export const RegionMetricBarChart: React.FC<RegionMetricBarChartProps> = ({
  data = [],
  metric,
  title,
  subtitle,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isProfit = metric === 'Profit';
  const barColor = isProfit ? '#10b981' : '#f59e0b';
  const hoverColor = isProfit ? '#059669' : '#d97706';

  const stats = useMemo(() => {
    const map = new Map<string, { region: string; profit: number; quantity: number; sales: number; orders: number }>();

    data.forEach((item) => {
      const cur = map.get(item.Region) || { region: item.Region, profit: 0, quantity: 0, sales: 0, orders: 0 };
      cur.profit += Number(item.Profit) || 0;
      cur.quantity += Number(item.Quantity) || 1;
      cur.sales += Number(item.Sales) || 0;
      cur.orders += 1;
      map.set(item.Region, cur);
    });

    const list = Array.from(map.values());
    list.sort((a, b) => (isProfit ? b.profit - a.profit : b.quantity - a.quantity));

    const totalVal = list.reduce((s, x) => s + (isProfit ? x.profit : x.quantity), 0);

    return list.map((item) => {
      const val = isProfit ? item.profit : item.quantity;
      const margin = item.sales > 0 ? (item.profit / item.sales) * 100 : 0;
      return {
        ...item,
        val,
        margin,
        share: totalVal > 0 ? (val / totalVal) * 100 : 0,
      };
    });
  }, [data, isProfit]);

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[280px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No regional data available.</p>
      </div>
    );
  }

  const maxVal = Math.max(...stats.map((s) => s.val), 10);
  const xMax = maxVal * 1.15;

  const formatDisplay = (val: number) => {
    if (!isProfit) return `${val.toLocaleString()} units`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}k`;
    return `$${Math.round(val)}`;
  };

  const formatFull = (val: number) => {
    if (!isProfit) return `${val.toLocaleString()} physical units`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Dimensions
  const svgWidth = 560;
  const svgHeight = 240;
  const padLeft = 85;
  const padRight = 55;
  const padTop = 20;
  const padBottom = 35;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const numBars = stats.length;
  const slotH = chartH / numBars;
  const barH = Math.min(slotH * 0.52, 28);

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
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: barColor }}
          />
          <span>{isProfit ? 'Profit ($)' : 'Units (Qty)'}</span>
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
                  {formatDisplay(tickVal)}
                </text>
              </g>
            );
          })}

          {/* Horizontal Bars */}
          {stats.map((item, idx) => {
            const barW = Math.max((item.val / xMax) * chartW, 4);
            const barY = padTop + idx * slotH + (slotH - barH) / 2;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.region}
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
                    fill={isProfit ? '#ecfdf5' : '#fef3c7'}
                    opacity={0.4}
                    rx={4}
                  />
                )}

                {/* Y-axis Region Label */}
                <text
                  x={padLeft - 12}
                  y={barY + barH / 2 + 4}
                  textAnchor="end"
                  className={`text-xs font-semibold transition-colors ${
                    isHovered
                      ? isProfit
                        ? 'fill-emerald-800'
                        : 'fill-amber-800'
                      : 'fill-slate-700'
                  }`}
                >
                  {item.region}
                </text>

                {/* Horizontal Bar */}
                <rect
                  x={padLeft}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx={4}
                  ry={4}
                  fill={isHovered ? hoverColor : barColor}
                  className="transition-colors duration-200"
                />

                {/* Value Label to Right of Bar */}
                <text
                  x={padLeft + barW + 8}
                  y={barY + barH / 2 + 3.5}
                  textAnchor="start"
                  className={`text-[11px] font-mono font-bold transition-colors ${
                    isHovered
                      ? isProfit
                        ? 'fill-emerald-800'
                        : 'fill-amber-800'
                      : 'fill-slate-800'
                  }`}
                >
                  {formatDisplay(item.val)}
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
            <div className="font-bold text-slate-100">{stats[hoveredIdx].region} Region</div>
            <div
              className={`font-mono font-bold mt-0.5 ${
                isProfit ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {metric}: {formatFull(stats[hoveredIdx].val)}
            </div>
            {isProfit && (
              <div className="text-slate-300 text-[10px] font-mono mt-0.5">
                Profit Margin: {stats[hoveredIdx].margin.toFixed(2)}%
              </div>
            )}
            <div className="text-slate-400 text-[10px] font-mono mt-0.5">
              Share: {stats[hoveredIdx].share.toFixed(1)}% ({stats[hoveredIdx].orders} orders)
            </div>
          </div>
        )}
      </div>

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Y-Axis: Sales Region</span>
        <span>X-Axis: Regional {metric}</span>
      </div>
    </div>
  );
};
