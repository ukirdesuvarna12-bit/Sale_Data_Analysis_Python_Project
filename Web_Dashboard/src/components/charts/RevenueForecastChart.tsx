import React, { useState } from 'react';
import { monthlyRevenueData } from '../../data/mockSalesData';
import { MonthlyRevenue } from '../../types/sales';

export const RevenueForecastChart: React.FC = () => {
  const [activeView, setActiveView] = useState<'arr' | 'composition'>('arr');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyRevenue | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 800;
  const height = 260;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const data = monthlyRevenueData;
  const maxVal = 700000;
  const minVal = 200000;

  const getX = (index: number) => paddingLeft + (index / (data.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  // Actual points (exclude future zero-actual months for actual line)
  const actualDataPoints = data.map((d, i) => ({ ...d, x: getX(i), y: getY(d.actual) })).filter(d => d.actual > 0);
  const targetDataPoints = data.map((d, i) => ({ ...d, x: getX(i), y: getY(d.target) }));
  const forecastDataPoints = data.map((d, i) => ({ ...d, x: getX(i), y: getY(d.forecast) }));

  // Generate SVG path strings
  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

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

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const actualPath = buildSmoothPath(actualDataPoints);
  const targetPath = buildSmoothPath(targetDataPoints);
  const forecastPath = buildSmoothPath(forecastDataPoints);

  // Shaded area for actual
  const actualAreaPath = actualDataPoints.length > 0
    ? `${actualPath} L ${actualDataPoints[actualDataPoints.length - 1].x} ${paddingTop + chartHeight} L ${actualDataPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';

  const formatK = (val: number) => `$${Math.round(val / 1000)}k`;

  return (
    <div className="bg-[#121926] border border-slate-800/80 rounded-lg p-5">
      {/* Header with View Toggle and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Revenue Trajectory & Forecast Model</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Historical closed ARR</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Board Target</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Q4 Weighted Run-rate</span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#0b0f17] p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveView('arr')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeView === 'arr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ARR Trajectory
          </button>
          <button
            onClick={() => setActiveView('composition')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeView === 'composition' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Net Bookings vs Churn
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[200000, 300000, 400000, 500000, 600000, 700000].map((val) => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[11px] fill-slate-500 font-mono tabular-nums"
                >
                  {formatK(val)}
                </text>
              </g>
            );
          })}

          {activeView === 'arr' ? (
            <>
              {/* Forecast Area for projected months */}
              <path
                d={actualAreaPath}
                fill="url(#actualGradient)"
              />

              {/* Board Target Line (Dashed Slate/Amber) */}
              <path
                d={targetPath}
                fill="none"
                stroke="#64748b"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Forecast Projection Line (Cyan) */}
              <path
                d={forecastPath}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.8"
              />

              {/* Actual ARR Line (Vibrant Indigo) */}
              <path
                d={actualPath}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data points for actuals */}
              {actualDataPoints.map((pt, i) => (
                <circle
                  key={`pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoverIndex === i ? 6 : 4}
                  fill={hoverIndex === i ? '#ffffff' : '#6366f1'}
                  stroke="#0d131f"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-150"
                />
              ))}

              {/* Future forecast points */}
              {forecastDataPoints.slice(actualDataPoints.length).map((pt, i) => (
                <circle
                  key={`fc-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#06b6d4"
                  stroke="#0d131f"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                />
              ))}
            </>
          ) : (
            /* Net Bookings vs Churn Stacked Bars */
            <>
              {data.map((d, i) => {
                const x = getX(i);
                const barWidth = 24;
                const bookingsHeight = ((d.newBookings) / (maxVal - minVal)) * chartHeight;
                const churnHeight = ((d.churn) / (maxVal - minVal)) * chartHeight;
                const baseY = paddingTop + chartHeight;

                return (
                  <g key={`bar-${i}`}>
                    {/* Bookings bar */}
                    <rect
                      x={x - barWidth / 2}
                      y={baseY - bookingsHeight}
                      width={barWidth}
                      height={bookingsHeight}
                      fill="#6366f1"
                      rx="2"
                      opacity={hoverIndex === i ? 1 : 0.85}
                    />
                    {/* Churn negative bar */}
                    <rect
                      x={x - barWidth / 2}
                      y={baseY - churnHeight}
                      width={barWidth}
                      height={churnHeight}
                      fill="#ef4444"
                      rx="2"
                      opacity="0.75"
                    />
                  </g>
                );
              })}
            </>
          )}

          {/* Vertical inspection guideline on hover */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={paddingTop}
              x2={getX(hoverIndex)}
              y2={paddingTop + chartHeight}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="2 2"
              opacity="0.6"
            />
          )}

          {/* Month labels along X-axis */}
          {data.map((d, i) => {
            const x = getX(i);
            const isFuture = d.actual === 0;
            return (
              <text
                key={d.month}
                x={x}
                y={paddingTop + chartHeight + 20}
                textAnchor="middle"
                className={`text-[11px] font-mono tabular-nums ${
                  isFuture ? 'fill-cyan-400 font-semibold' : 'fill-slate-400'
                }`}
              >
                {d.month}
              </text>
            );
          })}

          {/* Transparent hit boxes for easy mouse interaction */}
          {data.map((d, i) => {
            const x = getX(i);
            const colWidth = chartWidth / (data.length - 1);
            return (
              <rect
                key={`hit-${i}`}
                x={x - colWidth / 2}
                y={paddingTop}
                width={colWidth}
                height={chartHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoverIndex(i);
                  setHoveredPoint(d);
                }}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setHoveredPoint(null);
                }}
              />
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && hoverIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-[#0b0f17] border border-slate-700/80 rounded-lg p-3 shadow-xl backdrop-blur text-xs"
            style={{
              left: `${Math.min(Math.max(getX(hoverIndex) - 40, 10), width - 200)}px`,
              top: '10px',
            }}
          >
            <div className="font-semibold text-white mb-1.5 flex items-center justify-between gap-3">
              <span>{hoveredPoint.month} {hoveredPoint.year}</span>
              {hoveredPoint.actual === 0 ? (
                <span className="text-[10px] text-cyan-400 font-mono uppercase">Projection</span>
              ) : (
                <span className="text-[10px] text-emerald-400 font-mono">Actual</span>
              )}
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              {hoveredPoint.actual > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Actual ARR:
                  </span>
                  <span className="text-white font-medium tabular-nums">{formatK(hoveredPoint.actual)}</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Target:
                </span>
                <span className="text-slate-300 tabular-nums">{formatK(hoveredPoint.target)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Forecast:
                </span>
                <span className="text-cyan-300 tabular-nums">{formatK(hoveredPoint.forecast)}</span>
              </div>
              <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-4">
                <span className="text-slate-400">New Bookings:</span>
                <span className="text-emerald-400 tabular-nums">+{formatK(hoveredPoint.newBookings)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Churn / Downsell:</span>
                <span className="text-rose-400 tabular-nums">-{formatK(hoveredPoint.churn)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-5 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-indigo-500 rounded-full" />
            <span className="text-slate-300">Actual ARR</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-slate-400" />
            <span>Target Plan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-cyan-400" />
            <span className="text-cyan-300">Projected Run-rate</span>
          </div>
        </div>

        <div className="text-slate-400 text-xs">
          <span>Q3 Performance:</span>{' '}
          <span className="font-mono text-emerald-400 font-medium tabular-nums">+11.2% over target</span>
        </div>
      </div>
    </div>
  );
};
