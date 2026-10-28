import React, { useMemo } from 'react';
import { SalesOrder, DashboardKPIs } from '../types/dashboard';
import { calculateDynamicKPIs } from '../services/dataProcessor';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Boxes,
  Receipt,
  Percent,
} from 'lucide-react';

interface KPICardsProps {
  kpis?: DashboardKPIs;
  data?: SalesOrder[];
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis: apiKpis, data = [] }) => {
  // Compute dynamically from data or use backend API KPIs
  const dynamicKpis = useMemo(() => {
    if (data && data.length > 0) {
      return calculateDynamicKPIs(data);
    }
    if (apiKpis) {
      return {
        totalSales: apiKpis.total_sales,
        totalProfit: apiKpis.total_profit,
        totalOrders: apiKpis.total_orders,
        totalQuantity: apiKpis.total_quantity,
        averageOrderValue: apiKpis.average_order_value,
        profitMargin: apiKpis.profit_margin,
        growth: {
          salesDeltaPct: 0,
          profitDeltaPct: 0,
          ordersDeltaPct: 0,
          quantityDeltaPct: 0,
          aovDeltaPct: 0,
          marginDeltaPts: 0,
        },
      };
    }
    return calculateDynamicKPIs([]);
  }, [apiKpis, data]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: val >= 1000 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const cards = [
    {
      id: 'sales',
      title: 'Total Sales',
      value: formatCurrency(dynamicKpis.totalSales),
      rawTooltip: `$${dynamicKpis.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      label: 'Gross revenue across orders',
      formula: 'SUM(Sales)',
    },
    {
      id: 'profit',
      title: 'Total Profit',
      value: formatCurrency(dynamicKpis.totalProfit),
      rawTooltip: `$${dynamicKpis.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      label: 'Net retained earnings',
      formula: 'SUM(Profit)',
      isProfit: true,
      profitVal: dynamicKpis.totalProfit,
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: dynamicKpis.totalOrders.toLocaleString(),
      rawTooltip: `${dynamicKpis.totalOrders} total completed orders`,
      icon: ShoppingBag,
      label: 'Completed transactions',
      formula: 'COUNT(Order_ID)',
    },
    {
      id: 'quantity',
      title: 'Total Quantity',
      value: dynamicKpis.totalQuantity.toLocaleString(),
      rawTooltip: `${dynamicKpis.totalQuantity} physical units shipped`,
      icon: Boxes,
      label: 'Physical units sold',
      formula: 'SUM(Quantity)',
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: formatCurrency(dynamicKpis.averageOrderValue),
      rawTooltip: `$${dynamicKpis.averageOrderValue.toFixed(2)} per order`,
      icon: Receipt,
      label: 'Mean ticket value',
      formula: 'Sales / Orders',
    },
    {
      id: 'margin',
      title: 'Profit Margin %',
      value: `${dynamicKpis.profitMargin.toFixed(2)}%`,
      rawTooltip: `${dynamicKpis.profitMargin.toFixed(2)}% net margin`,
      icon: Percent,
      label: 'Net return on gross revenue',
      formula: '(Profit / Sales) × 100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="group relative bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 flex flex-col justify-between h-[142px] overflow-hidden"
          >
            {/* Top Bar: Title & Subtle Icon */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 flex items-center justify-center shrink-0 transition-colors duration-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200">
                  <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>

              {/* Large Calculated Value */}
              <div
                className="text-xl xl:text-2xl font-bold font-mono text-[#0f172a] tracking-tight tabular-nums mt-1.5 truncate"
                title={card.rawTooltip}
              >
                {card.value}
              </div>
            </div>

            {/* Bottom: Small Descriptive Label & Formula Pill */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate text-slate-500 font-medium" title={card.label}>
                {card.label}
              </span>
              <span className="font-mono text-[9px] bg-slate-50 text-slate-400 group-hover:text-slate-600 group-hover:bg-slate-100 px-1.5 py-0.5 rounded font-medium shrink-0 ml-1 transition-colors">
                {card.formula}
              </span>
            </div>

            {/* Clean top hover accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
          </div>
        );
      })}
    </div>
  );
};
