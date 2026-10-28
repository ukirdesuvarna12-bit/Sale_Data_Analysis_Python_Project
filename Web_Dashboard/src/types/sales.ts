export type DealStage = 
  | 'prospecting'
  | 'qualification'
  | 'discovery'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export type DealHealth = 'healthy' | 'at_risk' | 'stalled';

export type DealSegment = 'Enterprise' | 'Mid-Market' | 'Growth';

export type SalesRegion = 'North America' | 'EMEA' | 'APAC' | 'LATAM';

export interface Deal {
  id: string;
  title: string;
  account: string;
  value: number;
  stage: DealStage;
  repId: string;
  repName: string;
  repAvatar: string;
  probability: number; // 0 - 100
  closeDate: string;
  segment: DealSegment;
  region: SalesRegion;
  health: DealHealth;
  productLine: string;
  lastContactDate: string;
  notes?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  quota: number;
  closedWon: number;
  pipelineValue: number;
  winRate: number; // e.g. 38.5%
  avgCycleDays: number;
  dealsCount: number;
  targetAttainmentPct: number;
  region: SalesRegion;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  actual: number;
  target: number;
  forecast: number;
  newBookings: number;
  expansion: number;
  churn: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  account: string;
  amount: number;
  date: string;
  productLine: string;
  paymentStatus: 'settled' | 'processing' | 'pending' | 'failed';
  repName: string;
  region: SalesRegion;
  segment: DealSegment;
}

export interface RegionalMetric {
  region: SalesRegion;
  revenue: number;
  target: number;
  growthYoY: number;
  activeDeals: number;
  sharePct: number;
}

export interface StageFunnelItem {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
  conversionRate: number; // percentage converting to next
}

export type TimeWindow = 'month' | 'quarter' | 'ytd' | 'trailing_12m';
