export interface User {
  id: string;
  email: string;
  name: string;
  role: 'trader' | 'risk_manager' | 'admin' | 'compliance';
  avatar?: string;
  created_at: string;
}

export interface Portfolio {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  total_value: number;
  var_1d: number;
  pnl_today: number;
  margin_utilization: number;
  risk_level: 'low' | 'medium' | 'high';
  last_updated: string;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  value: number;
  sector: string;
  asset_class: string;
  region: string;
  weight_percent: number;
}

export interface SuspiciousTrade {
  id: string;
  portfolio_id: string;
  portfolio_name: string;
  symbol: string;
  trade_type: 'wash_trade' | 'off_market_price' | 'volume_spike' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  amount: number;
  timestamp: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  assigned_to?: string;
}

export interface Alert {
  id: string;
  type: 'var_breach' | 'concentration_risk' | 'margin_call' | 'suspicious_trade';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  portfolio_id?: string;
  portfolio_name?: string;
  threshold_value?: number;
  current_value?: number;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  created_by?: string;
}

export interface RiskMetrics {
  portfolio_id: string;
  var_1d: number;
  var_5d: number;
  expected_shortfall: number;
  beta: number;
  sharpe_ratio: number;
  max_drawdown: number;
  sector_concentration: Record<string, number>;
  geographic_exposure: Record<string, number>;
  currency_exposure: Record<string, number>;
  timestamp: string;
}

export interface AlertRule {
  id: string;
  name: string;
  type: Alert['type'];
  threshold: number;
  comparison: 'greater_than' | 'less_than' | 'equals';
  enabled: boolean;
  portfolios: string[];
  notification_channels: ('email' | 'push' | 'in_app')[];
  created_by: string;
  created_at: string;
}