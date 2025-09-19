import type { Portfolio, Holding, SuspiciousTrade, Alert, RiskMetrics } from '../types';

// Mock portfolios data
export const mockPortfolios: Portfolio[] = [
  {
    id: 'port-1',
    name: 'Tech Growth Portfolio',
    client_id: 'client-1',
    client_name: 'Apex Capital',
    total_value: 12500000,
    var_1d: -187500,
    pnl_today: 125000,
    margin_utilization: 0.65,
    risk_level: 'high',
    last_updated: new Date().toISOString(),
    holdings: [
      {
        id: 'hold-1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 50000,
        price: 185.25,
        value: 9262500,
        sector: 'Technology',
        asset_class: 'Equity',
        region: 'North America',
        weight_percent: 74.1
      },
      {
        id: 'hold-2',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        quantity: 8500,
        price: 378.90,
        value: 3220650,
        sector: 'Technology',
        asset_class: 'Equity',
        region: 'North America',
        weight_percent: 25.8
      }
    ]
  },
  {
    id: 'port-2',
    name: 'Diversified Equity',
    client_id: 'client-2',
    client_name: 'Sterling Investments',
    total_value: 8750000,
    var_1d: -131250,
    pnl_today: -45000,
    margin_utilization: 0.42,
    risk_level: 'medium',
    last_updated: new Date().toISOString(),
    holdings: [
      {
        id: 'hold-3',
        symbol: 'JPM',
        name: 'JPMorgan Chase',
        quantity: 25000,
        price: 165.80,
        value: 4145000,
        sector: 'Financials',
        asset_class: 'Equity',
        region: 'North America',
        weight_percent: 47.4
      },
      {
        id: 'hold-4',
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        quantity: 28000,
        price: 164.50,
        value: 4606000,
        sector: 'Healthcare',
        asset_class: 'Equity',
        region: 'North America',
        weight_percent: 52.6
      }
    ]
  },
  {
    id: 'port-3',
    name: 'Fixed Income Plus',
    client_id: 'client-3',
    client_name: 'Global Asset Management',
    total_value: 15200000,
    var_1d: -76000,
    pnl_today: 25000,
    margin_utilization: 0.28,
    risk_level: 'low',
    last_updated: new Date().toISOString(),
    holdings: [
      {
        id: 'hold-5',
        symbol: 'TLT',
        name: '20+ Year Treasury Bond ETF',
        quantity: 150000,
        price: 101.33,
        value: 15199500,
        sector: 'Government Bonds',
        asset_class: 'Fixed Income',
        region: 'North America',
        weight_percent: 100.0
      }
    ]
  }
];

// Mock suspicious trades
export const mockSuspiciousTrades: SuspiciousTrade[] = [
  {
    id: 'trade-1',
    portfolio_id: 'port-1',
    portfolio_name: 'Tech Growth Portfolio',
    symbol: 'AAPL',
    trade_type: 'volume_spike',
    severity: 'high',
    amount: 5250000,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    description: 'Unusual volume spike detected - 500% above 30-day average',
    status: 'new',
  },
  {
    id: 'trade-2',
    portfolio_id: 'port-2',
    portfolio_name: 'Diversified Equity',
    symbol: 'JPM',
    trade_type: 'off_market_price',
    severity: 'medium',
    amount: 850000,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
    description: 'Trade executed 3.2% below market price',
    status: 'investigating',
    assigned_to: 'compliance@finsmart.com'
  },
  {
    id: 'trade-3',
    portfolio_id: 'port-1',
    portfolio_name: 'Tech Growth Portfolio',
    symbol: 'MSFT',
    trade_type: 'wash_trade',
    severity: 'low',
    amount: 320000,
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
    description: 'Potential wash trading pattern detected',
    status: 'resolved',
    assigned_to: 'risk@finsmart.com'
  }
];

// Mock alerts
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'concentration_risk',
    title: 'High Technology Sector Concentration',
    description: 'Technology sector exposure (74.1%) exceeds threshold (70%)',
    severity: 'high',
    portfolio_id: 'port-1',
    portfolio_name: 'Tech Growth Portfolio',
    threshold_value: 70,
    current_value: 74.1,
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    status: 'active'
  },
  {
    id: 'alert-2',
    type: 'var_breach',
    title: 'VaR Limit Breach',
    description: '1-day VaR (-$187,500) exceeds limit (-$150,000)',
    severity: 'medium',
    portfolio_id: 'port-1',
    portfolio_name: 'Tech Growth Portfolio',
    threshold_value: -150000,
    current_value: -187500,
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    status: 'acknowledged'
  },
  {
    id: 'alert-3',
    type: 'suspicious_trade',
    title: 'Suspicious Trading Activity',
    description: 'High volume spike detected in AAPL',
    severity: 'high',
    portfolio_id: 'port-1',
    portfolio_name: 'Tech Growth Portfolio',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'active'
  }
];

// Function to generate real-time updates
export const generateRealTimeUpdate = (portfolio: Portfolio): Partial<Portfolio> => {
  const variance = 0.002; // 0.2% variance
  const pnlVariance = portfolio.total_value * 0.001; // 0.1% of total value
  
  return {
    ...portfolio,
    pnl_today: portfolio.pnl_today + (Math.random() - 0.5) * pnlVariance,
    var_1d: portfolio.var_1d * (1 + (Math.random() - 0.5) * variance),
    margin_utilization: Math.max(0.1, Math.min(0.95, portfolio.margin_utilization + (Math.random() - 0.5) * 0.02)),
    last_updated: new Date().toISOString()
  };
};

// Mock risk metrics
export const mockRiskMetrics: RiskMetrics[] = [
  {
    portfolio_id: 'port-1',
    var_1d: -187500,
    var_5d: -425000,
    expected_shortfall: -312000,
    beta: 1.35,
    sharpe_ratio: 1.82,
    max_drawdown: -0.18,
    sector_concentration: {
      'Technology': 74.1,
      'Consumer Discretionary': 12.5,
      'Healthcare': 8.2,
      'Financials': 5.2
    },
    geographic_exposure: {
      'North America': 85.5,
      'Europe': 10.2,
      'Asia Pacific': 4.3
    },
    currency_exposure: {
      'USD': 89.5,
      'EUR': 6.8,
      'JPY': 3.7
    },
    timestamp: new Date().toISOString()
  }
];