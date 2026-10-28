import React, { useState, useMemo } from 'react';
import { SalesOrder, MonthlySalesRecord } from '../../types/dashboard';

interface LineTrendChartProps {
  data?: SalesOrder[];
  monthlySales?: MonthlySalesRecord[];
  title?: string;
  subtitle?: string;
  metric?: 'Sales' | 'Profit';
}

export const LineTrendChart: React.FC<LineTrendChartProps> = ({
  data = [],
  monthlySales,
  title = 'Monthly Sales Trend',
  subtitle = 'Chronological gross revenue trajectory over order months',
  metric = 'Sales',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const isProfit = metric === 'Profit';
  const primaryColor = isProfit ? '#10b981' : '#2563eb';
  const lightColor = isProfit ? '#d1fae5' : '#bfdbfe';

  // Extract monthly trend from API or raw data
  const monthlyData = useMemo(() => {
    // If API monthly sales and metric is Sales
    if (!isProfit && monthlySales && monthlySales.length > 0) {
      const total = monthlySales.reduce((s, m) => s + m.Sales, 0);

      return monthlySales
        .map((item) => ({
          month: item.Order_Date.slice(0, 7),
          val: item.Sales,
          orders: 1,
          share: total > 0 ? (item.Sales / total) * 100 : 0,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));
    }

    const map = new Map<
      string,
      { month: string; val: number; orders: number }
    >();

    data.forEach((item) => {
      const month = item.Order_Date.slice(0, 7) || '2025-01';

      const existing = map.get(month) || {
        month,
        val: 0,
        orders: 0,
      };

      existing.val += isProfit
        ? Number(item.Profit) || 0
        : Number(item.Sales) || 0;

      existing.orders += 1;

      map.set(month, existing);
    });

    const total = Array.from(map.values()).reduce(
      (s, v) => s + v.val,
      0
    );

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        share: total > 0 ? (item.val / total) * 100 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [data, monthlySales, isProfit]);

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">
          No monthly {metric.toLowerCase()} records available.
        </p>
      </div>
    );
  }

  // Dimensions
  const svgWidth = 560;
  const svgHeight = 260;
  const padLeft = 65;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;

  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const maxVal = Math.max(...monthlyData.map((d) => d.val), 100);
  const yMax = maxVal * 1.15;
  const yMin = 0;

  const getX = (idx: number) => {
    if (monthlyData.length === 1) {
      return padLeft + chartW / 2;
    }

    return (
      padLeft +
      (idx / (monthlyData.length - 1)) * chartW
    );
  };

  const getY = (val: number) => {
    const clamped = Math.max(val, yMin);

    return (
      padTop +
      chartH -
      ((clamped - yMin) / (yMax - yMin)) * chartH
    );
  };

  // Build smooth cubic bezier curve
  const buildSmoothPath = (
    pts: { x: number; y: number }[]
  ) => {
    if (pts.length === 0) return '';

    if (pts.length === 1) {
      return `M ${pts[0].x} ${pts[0].y}`;
    }

    let path = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;

      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(
        1
      )}, ${cp2x.toFixed(1)} ${cp2y.toFixed(
        1
      )}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    return path;
  };

  const points = monthlyData.map((d, i) => ({
    x: getX(i),
    y: getY(d.val),
  }));

  const linePath = buildSmoothPath(points);

  const areaPath =
    points.length > 0
      ? `${linePath} L ${
          points[points.length - 1].x
        } ${padTop + chartH} L ${points[0].x} ${
          padTop + chartH
        } Z`
      : '';

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(2)}M`;
    }

    if (val >= 1_000) {
      return `$${(val / 1_000).toFixed(0)}k`;
    }

    return `$${Math.round(val)}`;
  };

  const formatFull = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const yTicks = [
    0,
    yMax * 0.25,
    yMax * 0.5,
    yMax * 0.75,
    yMax,
  ];

  // Show fewer X-axis labels for long date ranges
  const labelStep =
    monthlyData.length > 120
      ? 60
      : monthlyData.length > 60
      ? 24
      : monthlyData.length > 24
      ? 6
      : 1;

  const gradientId = `trendGradient_${metric}`;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
      {/* Header & Legend */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span
            className="w-2.5 h-0.5 rounded-full inline-block"
            style={{ backgroundColor: primaryColor }}
          />

          <span>Monthly {metric} ($)</span>
        </div>
      </div>

      {/* SVG Smooth Line & Area Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={primaryColor}
                stopOpacity="0.22"
              />

              <stop
                offset="90%"
                stopColor={primaryColor}
                stopOpacity="0.01"
              />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((tickVal, i) => {
            const y =
              padTop +
              chartH -
              (tickVal / yMax) * chartH;

            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartW}
                  y2={y}
                  stroke={
                    i === 0
                      ? '#cbd5e1'
                      : '#f1f5f9'
                  }
                  strokeWidth={
                    i === 0 ? 1.5 : 1
                  }
                  strokeDasharray={
                    i === 0 ? undefined : '3 3'
                  }
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

          {/* Area Fill */}
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
          />

          {/* Smooth Line */}
          <path
            d={linePath}
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active Hover Crosshair Guideline */}
          {hoveredIdx !== null &&
            points[hoveredIdx] && (
              <line
                x1={points[hoveredIdx].x}
                y1={padTop}
                x2={points[hoveredIdx].x}
                y2={padTop + chartH}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered =
              hoveredIdx === idx;

            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredIdx(idx)
                }
                onMouseLeave={() =>
                  setHoveredIdx(null)
                }
              >
                {/* Hit area */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={16}
                  fill="transparent"
                />

                {/* Outer halo on hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={7}
                    fill={lightColor}
                    opacity={0.8}
                  />
                )}

                {/* Core dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.5 : 3}
                  fill="#ffffff"
                  stroke={primaryColor}
                  strokeWidth={
                    isHovered ? 2.5 : 2
                  }
                  className="transition-all duration-150"
                />

                {/* X-axis Month Label */}
                {idx % labelStep === 0 && (
                  <text
                    x={pt.x}
                    y={padTop + chartH + 20}
                    textAnchor="middle"
                    className={`text-[10px] font-mono transition-colors ${
                      isHovered
                        ? isProfit
                          ? 'fill-emerald-700 font-bold'
                          : 'fill-blue-700 font-bold'
                        : 'fill-slate-500'
                    }`}
                  >
                    {new Date(`${monthlyData[idx].month}-01`).toLocaleDateString(
  'en-US',
  {
    month: 'short',
    year: 'numeric',
  }
)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null &&
          monthlyData[hoveredIdx] && (
            <div className="absolute top-2 right-2 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-10 font-sans border border-slate-700">
              <div className="font-bold text-slate-100 font-mono">
                Month:{' '}
                {monthlyData[hoveredIdx].month}
              </div>

              <div
                className={`font-mono font-bold mt-0.5 ${
                  isProfit
                    ? 'text-emerald-400'
                    : 'text-blue-400'
                }`}
              >
                {metric}:{' '}
                {formatFull(
                  monthlyData[hoveredIdx].val
                )}
              </div>

              <div className="text-slate-400 text-[10px] font-mono mt-0.5">
                {monthlyData[hoveredIdx].orders}{' '}
                orders (
                {monthlyData[
                  hoveredIdx
                ].share.toFixed(1)}
                % of total)
              </div>
            </div>
          )}
      </div>

      {/* Axis Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>X-Axis: Order Month</span>
        <span>
          Y-Axis: Total {metric} (USD)
        </span>
      </div>
    </div>
  );
};