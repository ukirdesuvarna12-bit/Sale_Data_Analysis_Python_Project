import { SalesOrder } from '../types/dashboard';

/**
 * Data Processing Layer for Sales Analytics
 * Strictly enforces real data calculation without hardcoded mock values.
 */

export interface DynamicKPIResult {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  profitMargin: number;
  // Dynamic growth metrics comparing chronological halves
  growth: {
    salesDeltaPct: number;
    profitDeltaPct: number;
    ordersDeltaPct: number;
    quantityDeltaPct: number;
    aovDeltaPct: number;
    marginDeltaPts: number;
  };
}

export interface MonthlyTrendItem {
  month: string; // YYYY-MM
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  marginPct: number;
}

export interface CategoryBreakdownItem {
  category: string;
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  marginPct: number;
  salesSharePct: number;
}

export interface RegionalBreakdownItem {
  region: string;
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  marginPct: number;
  salesSharePct: number;
}

export interface RankedItem {
  name: string;
  category?: string;
  region?: string;
  sales: number;
  profit: number;
  quantity: number;
  orders: number;
  marginPct: number;
}

/**
 * Strict Dynamic KPI Calculation:
 * - Total Sales = SUM(Sales)
 * - Total Profit = SUM(Profit)
 * - Total Orders = COUNT(Order_ID)
 * - Total Quantity = SUM(Quantity)
 * - Average Order Value = Total Sales / Total Orders
 * - Profit Margin = (Total Profit / Total Sales) * 100
 */
export function calculateDynamicKPIs(data: SalesOrder[]): DynamicKPIResult {
  if (!data || data.length === 0) {
    return {
      totalSales: 0,
      totalProfit: 0,
      totalOrders: 0,
      totalQuantity: 0,
      averageOrderValue: 0,
      profitMargin: 0,
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

  // 1. Total Sales = SUM(Sales)
  const totalSales = data.reduce((sum, item) => sum + (Number(item.Sales) || 0), 0);

  // 2. Total Profit = SUM(Profit)
  const totalProfit = data.reduce((sum, item) => sum + (Number(item.Profit) || 0), 0);

  // 3. Total Orders = COUNT(Order_ID)
  const totalOrders = data.length;

  // 4. Total Quantity = SUM(Quantity)
  const totalQuantity = data.reduce((sum, item) => sum + (Number(item.Quantity) || 0), 0);

  // 5. Average Order Value = Total Sales / Total Orders
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // 6. Profit Margin = (Total Profit / Total Sales) * 100
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Chronological Growth Calculation (Prior half vs Recent half)
  const sorted = [...data].sort((a, b) => (a.Order_Date || '').localeCompare(b.Order_Date || ''));
  const midpoint = Math.floor(sorted.length / 2);

  const prevSlice = sorted.length >= 2 ? sorted.slice(0, midpoint) : sorted;
  const currSlice = sorted.length >= 2 ? sorted.slice(midpoint) : sorted;

  const calcSubset = (items: SalesOrder[]) => {
    const s = items.reduce((sum, i) => sum + (Number(i.Sales) || 0), 0);
    const p = items.reduce((sum, i) => sum + (Number(i.Profit) || 0), 0);
    const o = items.length;
    const q = items.reduce((sum, i) => sum + (Number(i.Quantity) || 0), 0);
    const a = o > 0 ? s / o : 0;
    const m = s > 0 ? (p / s) * 100 : 0;
    return { s, p, o, q, a, m };
  };

  const prev = calcSubset(prevSlice);
  const curr = calcSubset(currSlice);

  const growthPct = (currentVal: number, prevVal: number) => {
    if (prevVal === 0) return currentVal > 0 ? 100 : 0;
    return ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
  };

  return {
    totalSales,
    totalProfit,
    totalOrders,
    totalQuantity,
    averageOrderValue,
    profitMargin,
    growth: {
      salesDeltaPct: growthPct(curr.s, prev.s),
      profitDeltaPct: growthPct(curr.p, prev.p),
      ordersDeltaPct: growthPct(curr.o, prev.o),
      quantityDeltaPct: growthPct(curr.q, prev.q),
      aovDeltaPct: growthPct(curr.a, prev.a),
      marginDeltaPts: curr.m - prev.m,
    },
  };
}

/**
 * Monthly trend aggregation from Order_Date (YYYY-MM)
 */
export function calculateMonthlyTrend(data: SalesOrder[]): MonthlyTrendItem[] {
  const map = new Map<string, { month: string; sales: number; profit: number; quantity: number; orders: number }>();

  data.forEach((item) => {
    const month = (item.Order_Date || 'Unknown').slice(0, 7);
    const existing = map.get(month) || { month, sales: 0, profit: 0, quantity: 0, orders: 0 };
    existing.sales += Number(item.Sales) || 0;
    existing.profit += Number(item.Profit) || 0;
    existing.quantity += Number(item.Quantity) || 0;
    existing.orders += 1;
    map.set(month, existing);
  });

  return Array.from(map.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      ...m,
      marginPct: m.sales > 0 ? (m.profit / m.sales) * 100 : 0,
    }));
}

/**
 * Category breakdown aggregation
 */
export function calculateCategoryBreakdown(data: SalesOrder[]): CategoryBreakdownItem[] {
  const map = new Map<string, { category: string; sales: number; profit: number; quantity: number; orders: number }>();

  data.forEach((item) => {
    const key = item.Category || 'Uncategorized';
    const existing = map.get(key) || { category: key, sales: 0, profit: 0, quantity: 0, orders: 0 };
    existing.sales += Number(item.Sales) || 0;
    existing.profit += Number(item.Profit) || 0;
    existing.quantity += Number(item.Quantity) || 0;
    existing.orders += 1;
    map.set(key, existing);
  });

  const list = Array.from(map.values());
  const grandSales = list.reduce((s, c) => s + c.sales, 0);

  return list
    .map((c) => ({
      ...c,
      marginPct: c.sales > 0 ? (c.profit / c.sales) * 100 : 0,
      salesSharePct: grandSales > 0 ? (c.sales / grandSales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

/**
 * Regional breakdown aggregation
 */
export function calculateRegionalBreakdown(data: SalesOrder[]): RegionalBreakdownItem[] {
  const map = new Map<string, { region: string; sales: number; profit: number; quantity: number; orders: number }>();

  data.forEach((item) => {
    const key = item.Region || 'Unknown';
    const existing = map.get(key) || { region: key, sales: 0, profit: 0, quantity: 0, orders: 0 };
    existing.sales += Number(item.Sales) || 0;
    existing.profit += Number(item.Profit) || 0;
    existing.quantity += Number(item.Quantity) || 0;
    existing.orders += 1;
    map.set(key, existing);
  });

  const list = Array.from(map.values());
  const grandSales = list.reduce((s, r) => s + r.sales, 0);

  return list
    .map((r) => ({
      ...r,
      marginPct: r.sales > 0 ? (r.profit / r.sales) * 100 : 0,
      salesSharePct: grandSales > 0 ? (r.sales / grandSales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales);
}

/**
 * Top Products / Top Customers ranking
 */
export function calculateRankings(
  data: SalesOrder[],
  groupBy: 'Product' | 'Customer_Name',
  metric: 'Sales' | 'Profit' | 'Quantity' | 'Orders' = 'Sales',
  limit = 5
): RankedItem[] {
  const map = new Map<string, RankedItem>();

  data.forEach((item) => {
    const key = groupBy === 'Product' ? item.Product || 'Unknown' : item.Customer_Name || 'Unknown';
    const existing = map.get(key) || {
      name: key,
      category: item.Category,
      region: item.Region,
      sales: 0,
      profit: 0,
      quantity: 0,
      orders: 0,
      marginPct: 0,
    };

    existing.sales += Number(item.Sales) || 0;
    existing.profit += Number(item.Profit) || 0;
    existing.quantity += Number(item.Quantity) || 0;
    existing.orders += 1;
    map.set(key, existing);
  });

  const list = Array.from(map.values()).map((item) => ({
    ...item,
    marginPct: item.sales > 0 ? (item.profit / item.sales) * 100 : 0,
  }));

  list.sort((a, b) => {
    if (metric === 'Sales') return b.sales - a.sales;
    if (metric === 'Profit') return b.profit - a.profit;
    if (metric === 'Quantity') return b.quantity - a.quantity;
    return b.orders - a.orders;
  });

  return list.slice(0, limit);
}

/**
 * Validation and normalization layer for raw spreadsheet records
 */
export function parseAndValidateRawRows(rawRows: any[]): SalesOrder[] {
  if (!rawRows || !Array.isArray(rawRows)) return [];

  const findField = (row: any, candidates: string[]) => {
    const keys = Object.keys(row);
    for (const key of keys) {
      const cleanKey = key.trim().toLowerCase().replace(/[\s_-]+/g, '');
      for (const candidate of candidates) {
        if (cleanKey === candidate.toLowerCase().replace(/[\s_-]+/g, '')) {
          return row[key];
        }
      }
    }
    return undefined;
  };

  const results: SalesOrder[] = [];

  rawRows.forEach((row, idx) => {
    const rawOrderId = findField(row, ['Order_ID', 'OrderID', 'Order ID', 'ID']) ?? `ORD${idx + 1}`;
    const rawDate = findField(row, ['Order_Date', 'OrderDate', 'Order Date', 'Date']);
    const rawCustomer = findField(row, ['Customer_Name', 'CustomerName', 'Customer Name', 'Customer']) ?? 'Unknown Customer';
    const rawCategory = findField(row, ['Category', 'Department']) ?? 'General';
    const rawProduct = findField(row, ['Product', 'Product_Name', 'Item']) ?? 'Item';
    const rawRegion = findField(row, ['Region', 'Territory']) ?? 'General';
    const rawQuantity = findField(row, ['Quantity', 'Qty']) ?? 1;
    const rawSales = findField(row, ['Sales', 'Revenue', 'Amount']) ?? 0;
    const rawProfit = findField(row, ['Profit', 'Margin']) ?? 0;

    // Normalize date
    let orderDate = '2026-01-01';
    if (typeof rawDate === 'number') {
      const dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
      if (!isNaN(dateObj.getTime())) {
        orderDate = dateObj.toISOString().split('T')[0];
      }
    } else if (typeof rawDate === 'string' && rawDate.trim() !== '') {
      const parsed = new Date(rawDate.trim());
      if (!isNaN(parsed.getTime())) {
        orderDate = parsed.toISOString().split('T')[0];
      } else {
        orderDate = rawDate.trim();
      }
    }

    results.push({
      Order_ID: String(rawOrderId).trim(),
      Order_Date: orderDate,
      Customer_Name: String(rawCustomer).trim(),
      Category: String(rawCategory).trim(),
      Product: String(rawProduct).trim(),
      Region: String(rawRegion).trim(),
      Quantity: Number(rawQuantity) || 1,
      Sales: Number(rawSales) || 0,
      Profit: Number(rawProfit) || 0,
    });
  });

  return results;
}
