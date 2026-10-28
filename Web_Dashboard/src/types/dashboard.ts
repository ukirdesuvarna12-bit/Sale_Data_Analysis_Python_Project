export interface SalesOrder {
  Order_ID: string;
  Order_Date: string; // YYYY-MM-DD
  Customer_Name: string;
  Category: string;
  Product: string;
  Region: string;
  Quantity: number;
  Sales: number;
  Profit: number;
}

export interface FilterState {
  startDate: string;
  endDate: string;
  category: string;
  region: string;
  product: string;
  customer: string;
}

export type PageId = 
  | 'overview' 
  | 'sales' 
  | 'product' 
  | 'customer' 
  | 'regional' 
  | 'datatable';

export interface KPISummary {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  profitMargin: number;
}

// Python Flask Backend API Types (http://127.0.0.1:5000/api/dashboard)
export interface DashboardKPIs {
  total_sales: number;
  total_profit: number;
  total_orders: number;
  total_quantity: number;
  average_order_value: number;
  profit_margin: number;
}

export interface MonthlySalesRecord {
  Order_Date: string;
  Sales: number;
}

export interface CategorySalesRecord {
  Category: string;
  Sales: number;
}

export interface CategoryProfitRecord {
  Category: string;
  Profit: number;
}

export interface RegionSalesRecord {
  Region: string;
  Sales: number;
}

export interface TopProductRecord {
  Product: string;
  Sales: number;
}

export interface TopCustomerRecord {
  Customer_Name: string;
  Sales: number;
}

export interface DashboardApiResponse {
  kpis: DashboardKPIs;
  monthly_sales: MonthlySalesRecord[];
  category_sales: CategorySalesRecord[];
  category_profit: CategoryProfitRecord[];
  region_sales: RegionSalesRecord[];
  top_products: TopProductRecord[];
  top_customers: TopCustomerRecord[];
  records?: SalesOrder[];
}
