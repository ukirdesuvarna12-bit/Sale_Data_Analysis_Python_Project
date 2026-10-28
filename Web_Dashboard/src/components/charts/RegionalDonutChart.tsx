import React, { useState, useMemo } from 'react';
import { SalesOrder, RegionSalesRecord } from '../../types/dashboard';

interface RegionalDonutChartProps {
  data?: SalesOrder[];
  regionSales?: RegionSalesRecord[];
  title?: string;
  subtitle?: string;
  metric?: string;
}

const REGION_PALETTE = [
  { region: 'West', color: '#2563eb', bg: 'bg-blue-600' },
  { region: 'South', color: '#0284c7', bg: 'bg-sky-600' },
  { region: 'East', color: '#4f46e5', bg: 'bg-indigo-600' },
  { region: 'North', color: '#0d9488', bg: 'bg-teal-600' },
];

export const RegionalDonutChart: React.FC<RegionalDonutChartProps> = ({
  data = [],
  regionSales,
  title = 'Sales by Region',
  subtitle = 'Geographic territory distribution of total revenue',
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  // Extract regional sales from API or raw data
  const regionalData = useMemo(() => {
    if (regionSales && regionSales.length > 0) {
      const total = regionSales.reduce((s, r) => s + r.Sales, 0);
      return regionSales.map((r, i) => ({
        region: r.Region,
        sales: r.Sales,
        share: total > 0 ? (r.Sales / total) * 100 : 0,
        color: REGION_PALETTE[i % REGION_PALETTE.length].color,
        bg: REGION_PALETTE[i % REGION_PALETTE.length].bg,
      })).sort((a, b) => b.sales - a.sales);
    }

    const map = new Map<string, number>();
    data.forEach((d) => {
      map.set(d.Region, (map.get(d.Region) || 0) + (Number(d.Sales) || 0));
    });

    const total = Array.from(map.values()).reduce((s, v) => s + v, 0);

    return Array.from(map.entries())
      .map(([reg, sales], i) => ({
        region: reg,
        sales,
        share: total > 0 ? (sales / total) * 100 : 0,
        color: REGION_PALETTE[i % REGION_PALETTE.length].color,
        bg: REGION_PALETTE[i % REGION_PALETTE.length].bg,
      }))
      .sort((a, b) => b.sales - a.sales);
  }, [data, regionSales]);

  const totalSales = useMemo(() => {
    return regionalData.reduce((sum, r) => sum + r.sales, 0);
  }, [regionalData]);

  if (regionalData.length === 0 || totalSales === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-sm font-bold text-[#0f172a]">{title}</h3>
        <p className="text-xs text-slate-400 mt-1">No regional sales records available.</p>
      </div>
    );
  }

  // Geometry calculations for Donut
  const radius = 86;
  const innerRadius = 56;
  const center = 110;
  const viewBoxSize = 220;

  let currentAngle = -Math.PI / 2; // 12 o'clock

  const slices = regionalData.map((item) => {
    const sliceAngle = (item.sales / totalSales) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    // Outer arc
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    // Inner arc
    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(startAngle);
    const iy2 = center + innerRadius * Math.sin(startAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      pathData,
    };
  });

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

  const hoveredSlice = slices.find((s) => s.region === hoveredRegion);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs flex flex-col justify-between relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-[#0f172a] tracking-tight">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-400">
          {regionalData.length} Regions
        </span>
      </div>

      {/* Main Content: Donut + Detailed Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-1">
        {/* SVG Donut */}
        <div className="sm:col-span-6 flex items-center justify-center relative">
          <svg
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            className="w-48 h-48 select-none overflow-visible"
          >
            {slices.map((slice) => {
              const isHovered = hoveredRegion === slice.region;
              return (
                <path
                  key={slice.region}
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-200 origin-center"
                  style={{
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`,
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                  }}
                  onMouseEnter={() => setHoveredRegion(slice.region)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
              );
            })}

            {/* Center Summary Content */}
            <circle cx={center} cy={center} r={innerRadius - 4} fill="#ffffff" />
            <text
              x={center}
              y={center - 4}
              textAnchor="middle"
              className="text-[14px] font-bold font-mono fill-slate-900"
            >
              {hoveredSlice ? formatCurrency(hoveredSlice.sales) : formatCurrency(totalSales)}
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              className="text-[10px] font-medium fill-slate-400 uppercase tracking-wider"
            >
              {hoveredSlice ? hoveredSlice.region : 'Total Sales'}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="sm:col-span-6 space-y-2.5">
          {slices.map((slice) => {
            const isHovered = hoveredRegion === slice.region;
            return (
              <div
                key={slice.region}
                onMouseEnter={() => setHoveredRegion(slice.region)}
                onMouseLeave={() => setHoveredRegion(null)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  isHovered ? 'bg-slate-50 border border-slate-200' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className={`text-xs font-semibold ${isHovered ? 'text-blue-700' : 'text-slate-700'}`}>
                    {slice.region}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-900">
                    {formatCurrency(slice.sales)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {slice.share.toFixed(1)}% share
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredSlice && (
        <div className="absolute top-2 right-2 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg shadow-lg text-xs z-10 font-sans border border-slate-700">
          <div className="font-bold text-slate-100">{hoveredSlice.region} Region</div>
          <div className="text-blue-400 font-mono font-bold mt-0.5">
            Sales: {formatFull(hoveredSlice.sales)}
          </div>
          <div className="text-slate-400 text-[10px] font-mono mt-0.5">
            Share: {hoveredSlice.share.toFixed(2)}% of regional revenue
          </div>
        </div>
      )}

      {/* Axis/Chart Information Footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Segments: Regional Sales Territories</span>
        <span>Metric: Gross Sales & Percentage Share</span>
      </div>
    </div>
  );
};
