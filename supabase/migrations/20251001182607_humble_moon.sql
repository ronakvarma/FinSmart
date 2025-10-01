/*
  # Seed Sample Data for FinSmart

  This migration populates the database with comprehensive sample data
  for development and testing purposes.
*/

-- Insert sample profiles
INSERT INTO profiles (id, email, name, role, preferences, is_active) VALUES
('user_admin_001', 'admin@finsmart.com', 'System Administrator', 'admin', '{"theme": "dark", "notifications": true}', true),
('user_risk_001', 'risk@finsmart.com', 'Sarah Johnson', 'risk_manager', '{"theme": "light", "notifications": true}', true),
('user_trader_001', 'trader@finsmart.com', 'Mike Chen', 'trader', '{"theme": "light", "notifications": false}', true),
('user_compliance_001', 'compliance@finsmart.com', 'Emma Rodriguez', 'compliance', '{"theme": "dark", "notifications": true}', true),
('user_trader_002', 'john.doe@finsmart.com', 'John Doe', 'trader', '{"theme": "light", "notifications": true}', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert sample portfolios
INSERT INTO portfolios (id, name, client_id, client_name, total_value, var_1d, var_5d, pnl_today, pnl_mtd, pnl_ytd, margin_utilization, risk_level, benchmark, currency, status, user_id) VALUES
('port_001', 'Tech Growth Portfolio', 'client_001', 'Apex Capital Management', 12500000.00, -187500.00, -425000.00, 125000.00, 450000.00, 1250000.00, 0.65, 'high', 'QQQ', 'USD', 'active', 'user_risk_001'),
('port_002', 'Diversified Equity Fund', 'client_002', 'Sterling Investments LLC', 8750000.00, -131250.00, -298000.00, -45000.00, 125000.00, 875000.00, 0.42, 'medium', 'SPY', 'USD', 'active', 'user_risk_001'),
('port_003', 'Fixed Income Plus', 'client_003', 'Global Asset Management', 15200000.00, -76000.00, -172000.00, 25000.00, 85000.00, 456000.00, 0.28, 'low', 'AGG', 'USD', 'active', 'user_risk_001'),
('port_004', 'International Growth', 'client_004', 'Meridian Capital Partners', 6800000.00, -102000.00, -231000.00, 68000.00, 204000.00, 680000.00, 0.55, 'medium', 'VEA', 'USD', 'active', 'user_risk_001'),
('port_005', 'Small Cap Value', 'client_005', 'Pinnacle Investment Group', 4200000.00, -84000.00, -190800.00, -21000.00, 42000.00, 210000.00, 0.38, 'high', 'IWM', 'USD', 'active', 'user_risk_001')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  total_value = EXCLUDED.total_value,
  updated_at = NOW();

-- Insert sample holdings for Tech Growth Portfolio
INSERT INTO holdings (id, portfolio_id, symbol, name, quantity, price, market_value, cost_basis, unrealized_pnl, sector, asset_class, region, weight_percent, beta, dividend_yield, pe_ratio) VALUES
('hold_001', 'port_001', 'AAPL', 'Apple Inc.', 50000, 185.25, 9262500.00, 8500000.00, 762500.00, 'Technology', 'Equity', 'North America', 74.10, 1.25, 0.0044, 28.5),
('hold_002', 'port_001', 'MSFT', 'Microsoft Corp.', 8500, 378.90, 3220650.00, 2975000.00, 245650.00, 'Technology', 'Equity', 'North America', 25.77, 1.15, 0.0072, 32.1),
('hold_003', 'port_001', 'CASH', 'Cash and Cash Equivalents', 1, 16850.00, 16850.00, 16850.00, 0.00, 'Cash', 'Cash', 'North America', 0.13, 0.00, 0.0000, NULL)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price,
  market_value = EXCLUDED.market_value,
  updated_at = NOW();

-- Insert sample holdings for Diversified Equity Fund
INSERT INTO holdings (id, portfolio_id, symbol, name, quantity, price, market_value, cost_basis, unrealized_pnl, sector, asset_class, region, weight_percent, beta, dividend_yield, pe_ratio) VALUES
('hold_004', 'port_002', 'JPM', 'JPMorgan Chase & Co.', 25000, 165.80, 4145000.00, 3875000.00, 270000.00, 'Financials', 'Equity', 'North America', 47.37, 1.18, 0.0241, 12.8),
('hold_005', 'port_002', 'JNJ', 'Johnson & Johnson', 28000, 164.50, 4606000.00, 4312000.00, 294000.00, 'Healthcare', 'Equity', 'North America', 52.63, 0.85, 0.0295, 15.2)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price,
  market_value = EXCLUDED.market_value,
  updated_at = NOW();

-- Insert sample holdings for Fixed Income Plus
INSERT INTO holdings (id, portfolio_id, symbol, name, quantity, price, market_value, cost_basis, unrealized_pnl, sector, asset_class, region, weight_percent, beta, dividend_yield, pe_ratio) VALUES
('hold_006', 'port_003', 'TLT', '20+ Year Treasury Bond ETF', 150000, 101.33, 15199500.00, 15500000.00, -300500.00, 'Government Bonds', 'Fixed Income', 'North America', 100.00, 0.25, 0.0385, NULL)
ON CONFLICT (id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price,
  market_value = EXCLUDED.market_value,
  updated_at = NOW();

-- Insert sample alerts
INSERT INTO alerts (id, type, title, description, severity, status, portfolio_id, threshold_value, current_value, created_by, expires_at) VALUES
('alert_001', 'concentration_risk', 'High Technology Sector Concentration', 'Technology sector exposure (74.1%) exceeds risk threshold (70%)', 'high', 'active', 'port_001', 70.0, 74.1, 'user_risk_001', NOW() + INTERVAL '7 days'),
('alert_002', 'var_breach', 'VaR Limit Breach - Tech Growth Portfolio', '1-day VaR (-$187,500) exceeds established limit (-$150,000)', 'medium', 'acknowledged', 'port_001', -150000.0, -187500.0, 'user_risk_001', NOW() + INTERVAL '3 days'),
('alert_003', 'suspicious_trade', 'Unusual Trading Activity Detected', 'High volume spike detected in AAPL - 500% above 30-day average', 'high', 'active', 'port_001', NULL, NULL, 'user_compliance_001', NOW() + INTERVAL '1 day'),
('alert_004', 'margin_call', 'Margin Utilization Warning', 'Margin utilization (65%) approaching maximum threshold (75%)', 'medium', 'active', 'port_001', 75.0, 65.0, 'user_risk_001', NOW() + INTERVAL '2 days'),
('alert_005', 'performance', 'Underperformance Alert', 'Portfolio trailing benchmark by more than 2% over 30 days', 'low', 'resolved', 'port_002', -2.0, -2.8, 'user_risk_001', NOW() + INTERVAL '30 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Insert sample suspicious trades
INSERT INTO suspicious_trades (id, portfolio_id, portfolio_name, symbol, trade_type, severity, amount, trade_price, market_price, volume, description, detection_algorithm, confidence_score, status, priority, assigned_to, reported_by, trade_timestamp) VALUES
('trade_001', 'port_001', 'Tech Growth Portfolio', 'AAPL', 'volume_spike', 'high', 5250000.00, 185.25, 185.30, 28350, 'Unusual volume spike detected - 500% above 30-day average during market hours', 'volume_anomaly_v2', 0.92, 'new', 1, NULL, 'user_compliance_001', NOW() - INTERVAL '15 minutes'),
('trade_002', 'port_002', 'Diversified Equity Fund', 'JPM', 'off_market_price', 'medium', 850000.00, 160.45, 165.80, 5150, 'Trade executed 3.2% below current market price', 'price_deviation_v1', 0.78, 'investigating', 2, 'user_compliance_001', 'user_compliance_001', NOW() - INTERVAL '45 minutes'),
('trade_003', 'port_001', 'Tech Growth Portfolio', 'MSFT', 'wash_trade', 'low', 320000.00, 378.90, 378.85, 845, 'Potential wash trading pattern detected - similar trades within 30-day period', 'wash_trade_v3', 0.65, 'resolved', 3, 'user_compliance_001', 'user_compliance_001', NOW() - INTERVAL '90 minutes'),
('trade_004', 'port_004', 'International Growth', 'VEA', 'timing_anomaly', 'medium', 425000.00, 45.20, 45.18, 9400, 'Trade executed outside normal market hours with unusual timing pattern', 'timing_analysis_v1', 0.71, 'investigating', 2, 'user_compliance_001', 'user_compliance_001', NOW() - INTERVAL '2 hours'),
('trade_005', 'port_005', 'Small Cap Value', 'IWM', 'size_anomaly', 'high', 1250000.00, 198.75, 198.80, 6290, 'Trade size significantly larger than historical average for this portfolio', 'size_anomaly_v2', 0.85, 'new', 1, NULL, 'user_compliance_001', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  confidence_score = EXCLUDED.confidence_score,
  updated_at = NOW();

-- Insert sample risk metrics
INSERT INTO risk_metrics (id, portfolio_id, calculation_date, var_1d, var_5d, var_1m, expected_shortfall, beta, alpha, sharpe_ratio, sortino_ratio, max_drawdown, volatility, tracking_error, information_ratio, sector_concentration, geographic_exposure, currency_exposure, asset_class_exposure, top_holdings, correlation_matrix, stress_test_results) VALUES
('risk_001', 'port_001', CURRENT_DATE, -187500.00, -425000.00, -850000.00, -312000.00, 1.35, 0.025, 1.82, 2.15, -0.18, 0.24, 0.08, 0.31, 
  '{"Technology": 74.1, "Cash": 0.13}',
  '{"North America": 100.0}',
  '{"USD": 100.0}',
  '{"Equity": 99.87, "Cash": 0.13}',
  '[{"symbol": "AAPL", "weight": 74.1}, {"symbol": "MSFT", "weight": 25.77}]',
  '{"AAPL_MSFT": 0.72, "AAPL_SPY": 0.85, "MSFT_SPY": 0.78}',
  '{"market_crash": {"loss": -2250000, "probability": 0.05}, "sector_rotation": {"loss": -875000, "probability": 0.15}}'
),
('risk_002', 'port_002', CURRENT_DATE, -131250.00, -298000.00, -595000.00, -218000.00, 1.12, 0.018, 1.45, 1.68, -0.12, 0.18, 0.06, 0.28,
  '{"Financials": 47.37, "Healthcare": 52.63}',
  '{"North America": 100.0}',
  '{"USD": 100.0}',
  '{"Equity": 100.0}',
  '[{"symbol": "JNJ", "weight": 52.63}, {"symbol": "JPM", "weight": 47.37}]',
  '{"JPM_JNJ": 0.45, "JPM_SPY": 0.82, "JNJ_SPY": 0.65}',
  '{"market_crash": {"loss": -1312500, "probability": 0.05}, "interest_rate_shock": {"loss": -525000, "probability": 0.20}}'
),
('risk_003', 'port_003', CURRENT_DATE, -76000.00, -172000.00, -344000.00, -126000.00, 0.25, -0.005, 0.85, 1.12, -0.05, 0.12, 0.04, -0.12,
  '{"Government Bonds": 100.0}',
  '{"North America": 100.0}',
  '{"USD": 100.0}',
  '{"Fixed Income": 100.0}',
  '[{"symbol": "TLT", "weight": 100.0}]',
  '{"TLT_SPY": -0.25, "TLT_AGG": 0.85}',
  '{"interest_rate_rise": {"loss": -1520000, "probability": 0.25}, "inflation_spike": {"loss": -760000, "probability": 0.15}}'
)
ON CONFLICT (portfolio_id, calculation_date) DO UPDATE SET
  var_1d = EXCLUDED.var_1d,
  var_5d = EXCLUDED.var_5d,
  updated_at = NOW();

-- Insert sample alert rules
INSERT INTO alert_rules (id, name, description, type, condition_field, operator, threshold_value, severity, enabled, portfolios, notification_channels, cooldown_minutes, created_by) VALUES
('rule_001', 'VaR Breach - High Risk', 'Alert when 1-day VaR exceeds -$200,000', 'var_breach', 'var_1d', '<', -200000.0, 'high', true, '{"port_001", "port_004", "port_005"}', '{"in_app", "email"}', 60, 'user_risk_001'),
('rule_002', 'Sector Concentration Risk', 'Alert when any sector exceeds 70% allocation', 'concentration_risk', 'sector_max_weight', '>', 70.0, 'medium', true, '{}', '{"in_app"}', 120, 'user_risk_001'),
('rule_003', 'Margin Utilization Warning', 'Alert when margin utilization exceeds 70%', 'margin_call', 'margin_utilization', '>', 0.70, 'medium', true, '{}', '{"in_app", "email"}', 30, 'user_risk_001'),
('rule_004', 'Performance Underperformance', 'Alert when portfolio underperforms benchmark by >3%', 'performance', 'relative_performance', '<', -3.0, 'low', true, '{}', '{"in_app"}', 1440, 'user_risk_001'),
('rule_005', 'Critical VaR Breach', 'Critical alert for extreme VaR breaches', 'var_breach', 'var_1d', '<', -500000.0, 'critical', true, '{}', '{"in_app", "email", "sms"}', 15, 'user_risk_001')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  threshold_value = EXCLUDED.threshold_value,
  updated_at = NOW();

-- Update acknowledged alert
UPDATE alerts 
SET acknowledged_by = 'user_trader_001', 
    acknowledged_at = NOW() - INTERVAL '30 minutes'
WHERE id = 'alert_002';

-- Update resolved alert
UPDATE alerts 
SET resolved_by = 'user_risk_001', 
    resolved_at = NOW() - INTERVAL '2 hours',
    status = 'resolved'
WHERE id = 'alert_005';

-- Update investigating trades
UPDATE suspicious_trades 
SET assigned_by = 'user_risk_001',
    assigned_at = NOW() - INTERVAL '20 minutes',
    investigation_notes = 'Initial review completed. Price deviation appears to be due to block trade execution. Monitoring for additional occurrences.'
WHERE id = 'trade_002';

UPDATE suspicious_trades 
SET assigned_by = 'user_risk_001',
    assigned_at = NOW() - INTERVAL '1 hour',
    investigation_notes = 'Timing analysis shows trade executed during pre-market hours. Checking with trader for justification.'
WHERE id = 'trade_004';

-- Update resolved trade
UPDATE suspicious_trades 
SET resolved_by = 'user_compliance_001',
    resolution_notes = 'Investigation completed. Pattern identified as legitimate rebalancing trades executed over multiple days. No wash trading violation found.',
    status = 'resolved'
WHERE id = 'trade_003';