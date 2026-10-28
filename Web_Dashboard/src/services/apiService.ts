import { DashboardApiResponse } from '../types/dashboard';

export const DEFAULT_FLASK_API_URL = 'http://127.0.0.1:5000/api/dashboard';

/**
 * Fetches dashboard metrics from the Python Flask backend:
 * Primary Endpoint: http://127.0.0.1:5000/api/dashboard
 * Proxy Endpoint: /api/dashboard (for HTTPS preview iframe to bypass mixed-content)
 */
export async function fetchDashboardData(endpointUrl: string = DEFAULT_FLASK_API_URL): Promise<DashboardApiResponse> {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

  // If in HTTPS preview and targeting http://127.0.0.1 or http://localhost,
  // prefer /api/dashboard to prevent browser Mixed Content block.
  const isLocalHttp = endpointUrl.startsWith('http://127.0.0.1:5000') || endpointUrl.startsWith('http://localhost:5000');
  const targetUrl = (isHttps && isLocalHttp) ? '/api/dashboard' : endpointUrl;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} at ${targetUrl}`);
    }

    const payload = await response.json();

    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid JSON response: root is not an object.');
    }

    if (!payload.kpis) {
      throw new Error('Invalid response: missing "kpis" object in Flask API payload.');
    }

    return {
      kpis: {
        total_sales: Number(payload.kpis.total_sales) || 0,
        total_profit: Number(payload.kpis.total_profit) || 0,
        total_orders: Number(payload.kpis.total_orders) || 0,
        total_quantity: Number(payload.kpis.total_quantity) || 0,
        average_order_value: Number(payload.kpis.average_order_value) || 0,
        profit_margin: Number(payload.kpis.profit_margin) || 0,
      },
      monthly_sales: Array.isArray(payload.monthly_sales)
        ? payload.monthly_sales.map((m: any) => ({
            Order_Date: String(m.Order_Date || ''),
            Sales: Number(m.Sales) || 0,
          }))
        : [],
      category_sales: Array.isArray(payload.category_sales)
        ? payload.category_sales.map((c: any) => ({
            Category: String(c.Category || 'Unknown'),
            Sales: Number(c.Sales) || 0,
          }))
        : [],
      category_profit: Array.isArray(payload.category_profit)
        ? payload.category_profit.map((c: any) => ({
            Category: String(c.Category || 'Unknown'),
            Profit: Number(c.Profit) || 0,
          }))
        : [],
      region_sales: Array.isArray(payload.region_sales)
        ? payload.region_sales.map((r: any) => ({
            Region: String(r.Region || 'Unknown'),
            Sales: Number(r.Sales) || 0,
          }))
        : [],
      top_products: Array.isArray(payload.top_products)
        ? payload.top_products.map((p: any) => ({
            Product: String(p.Product || 'Unknown'),
            Sales: Number(p.Sales) || 0,
          }))
        : [],
      top_customers: Array.isArray(payload.top_customers)
        ? payload.top_customers.map((cu: any) => ({
            Customer_Name: String(cu.Customer_Name || 'Unknown'),
            Sales: Number(cu.Sales) || 0,
          }))
        : [],
      records: Array.isArray(payload.records) ? payload.records : undefined,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);

    // Fallback: If direct attempt failed and wasn't using proxy, try proxy
    if (targetUrl !== '/api/dashboard') {
      try {
        const fallbackResp = await fetch('/api/dashboard', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        if (fallbackResp.ok) {
          const fallbackPayload = await fallbackResp.json();
          if (fallbackPayload && fallbackPayload.kpis) {
            return {
              kpis: {
                total_sales: Number(fallbackPayload.kpis.total_sales) || 0,
                total_profit: Number(fallbackPayload.kpis.total_profit) || 0,
                total_orders: Number(fallbackPayload.kpis.total_orders) || 0,
                total_quantity: Number(fallbackPayload.kpis.total_quantity) || 0,
                average_order_value: Number(fallbackPayload.kpis.average_order_value) || 0,
                profit_margin: Number(fallbackPayload.kpis.profit_margin) || 0,
              },
              monthly_sales: Array.isArray(fallbackPayload.monthly_sales) ? fallbackPayload.monthly_sales : [],
              category_sales: Array.isArray(fallbackPayload.category_sales) ? fallbackPayload.category_sales : [],
              category_profit: Array.isArray(fallbackPayload.category_profit) ? fallbackPayload.category_profit : [],
              region_sales: Array.isArray(fallbackPayload.region_sales) ? fallbackPayload.region_sales : [],
              top_products: Array.isArray(fallbackPayload.top_products) ? fallbackPayload.top_products : [],
              top_customers: Array.isArray(fallbackPayload.top_customers) ? fallbackPayload.top_customers : [],
            };
          }
        }
      } catch {
        // Fall through
      }
    }

    if (err.name === 'AbortError') {
      throw new Error(`Request to ${endpointUrl} timed out after 9s.`);
    }

    throw new Error(
      `Failed to connect to ${endpointUrl}. Make sure your Python Flask backend is running.`
    );
  }
}
