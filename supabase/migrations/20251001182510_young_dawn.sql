/*
  # Complete FinSmart Database Schema

  1. New Tables
    - `profiles` - User profiles with roles and authentication data
    - `portfolios` - Investment portfolios with risk metrics
    - `holdings` - Individual portfolio positions and securities
    - `alerts` - Risk and compliance alerts system
    - `suspicious_trades` - Trade monitoring and investigation
    - `risk_metrics` - Historical risk calculations and analytics
    - `alert_rules` - Configurable alert rules and thresholds
    - `audit_logs` - System audit trail and user activity

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for role-based access
    - Secure data access patterns

  3. Indexes and Performance
    - Add indexes for frequently queried columns
    - Optimize for real-time queries
    - Support for complex analytics
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'trader' CHECK (role IN ('trader', 'risk_manager', 'admin', 'compliance')),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  var_1d DECIMAL(15,2) NOT NULL DEFAULT 0,
  var_5d DECIMAL(15,2) NOT NULL DEFAULT 0,
  pnl_today DECIMAL(15,2) NOT NULL DEFAULT 0,
  pnl_mtd DECIMAL(15,2) NOT NULL DEFAULT 0,
  pnl_ytd DECIMAL(15,2) NOT NULL DEFAULT 0,
  margin_utilization DECIMAL(5,4) NOT NULL DEFAULT 0 CHECK (margin_utilization >= 0 AND margin_utilization <= 1),
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  benchmark TEXT DEFAULT 'SPY',
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  portfolio_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
  price DECIMAL(10,4) NOT NULL DEFAULT 0,
  market_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  cost_basis DECIMAL(15,2) NOT NULL DEFAULT 0,
  unrealized_pnl DECIMAL(15,2) NOT NULL DEFAULT 0,
  sector TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  region TEXT NOT NULL,
  weight_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  beta DECIMAL(8,4) DEFAULT 1.0,
  dividend_yield DECIMAL(5,4) DEFAULT 0,
  pe_ratio DECIMAL(8,2),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL CHECK (type IN ('var_breach', 'concentration_risk', 'margin_call', 'suspicious_trade', 'performance', 'compliance')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  portfolio_id TEXT,
  threshold_value DECIMAL(15,2),
  current_value DECIMAL(15,2),
  metadata JSONB DEFAULT '{}',
  created_by TEXT NOT NULL,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by) REFERENCES profiles(id) ON DELETE SET NULL,
  FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create suspicious_trades table
CREATE TABLE IF NOT EXISTS suspicious_trades (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  portfolio_id TEXT NOT NULL,
  portfolio_name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL CHECK (trade_type IN ('wash_trade', 'off_market_price', 'volume_spike', 'unusual_pattern', 'timing_anomaly', 'size_anomaly')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  amount DECIMAL(15,2) NOT NULL,
  trade_price DECIMAL(10,4),
  market_price DECIMAL(10,4),
  volume BIGINT,
  description TEXT NOT NULL,
  detection_algorithm TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive', 'escalated')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  assigned_to TEXT,
  assigned_by TEXT,
  assigned_at TIMESTAMPTZ,
  investigation_notes TEXT,
  resolution_notes TEXT,
  reported_by TEXT NOT NULL,
  trade_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create risk_metrics table
CREATE TABLE IF NOT EXISTS risk_metrics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  portfolio_id TEXT NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  var_1d DECIMAL(15,2) NOT NULL DEFAULT 0,
  var_5d DECIMAL(15,2) NOT NULL DEFAULT 0,
  var_1m DECIMAL(15,2) NOT NULL DEFAULT 0,
  expected_shortfall DECIMAL(15,2) NOT NULL DEFAULT 0,
  beta DECIMAL(8,4) NOT NULL DEFAULT 1.0,
  alpha DECIMAL(8,4) DEFAULT 0,
  sharpe_ratio DECIMAL(8,4) DEFAULT 0,
  sortino_ratio DECIMAL(8,4) DEFAULT 0,
  max_drawdown DECIMAL(8,4) DEFAULT 0,
  volatility DECIMAL(8,4) DEFAULT 0,
  tracking_error DECIMAL(8,4) DEFAULT 0,
  information_ratio DECIMAL(8,4) DEFAULT 0,
  sector_concentration JSONB NOT NULL DEFAULT '{}',
  geographic_exposure JSONB NOT NULL DEFAULT '{}',
  currency_exposure JSONB NOT NULL DEFAULT '{}',
  asset_class_exposure JSONB NOT NULL DEFAULT '{}',
  top_holdings JSONB DEFAULT '[]',
  correlation_matrix JSONB DEFAULT '{}',
  stress_test_results JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  UNIQUE(portfolio_id, calculation_date)
);

-- Create alert_rules table
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('var_breach', 'concentration_risk', 'margin_call', 'performance', 'compliance')),
  condition_field TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')),
  threshold_value DECIMAL(15,4) NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN DEFAULT true,
  portfolios TEXT[] DEFAULT '{}',
  notification_channels TEXT[] DEFAULT '{"in_app"}',
  cooldown_minutes INTEGER DEFAULT 60,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_client_id ON portfolios(client_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_risk_level ON portfolios(risk_level);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON portfolios(status);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_holdings_sector ON holdings(sector);
CREATE INDEX IF NOT EXISTS idx_holdings_asset_class ON holdings(asset_class);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_portfolio_id ON alerts(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON alerts(created_by);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_suspicious_trades_portfolio_id ON suspicious_trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_symbol ON suspicious_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_type ON suspicious_trades(trade_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_severity ON suspicious_trades(severity);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_status ON suspicious_trades(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_assigned_to ON suspicious_trades(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suspicious_trades_timestamp ON suspicious_trades(trade_timestamp);

CREATE INDEX IF NOT EXISTS idx_risk_metrics_portfolio_id ON risk_metrics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_risk_metrics_date ON risk_metrics(calculation_date);
CREATE INDEX IF NOT EXISTS idx_risk_metrics_timestamp ON risk_metrics(timestamp);

CREATE INDEX IF NOT EXISTS idx_alert_rules_type ON alert_rules(type);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules(enabled);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- RLS Policies for portfolios
CREATE POLICY "Users can read all portfolios" ON portfolios
  FOR SELECT USING (true);

CREATE POLICY "Risk managers can manage portfolios" ON portfolios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
    )
  );

-- RLS Policies for holdings
CREATE POLICY "Users can read all holdings" ON holdings
  FOR SELECT USING (true);

CREATE POLICY "Risk managers can manage holdings" ON holdings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
    )
  );

-- RLS Policies for alerts
CREATE POLICY "Users can read all alerts" ON alerts
  FOR SELECT USING (true);

CREATE POLICY "Users can acknowledge alerts" ON alerts
  FOR UPDATE USING (true);

CREATE POLICY "Risk managers can manage alerts" ON alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin', 'compliance')
    )
  );

-- RLS Policies for suspicious_trades
CREATE POLICY "Users can read all suspicious trades" ON suspicious_trades
  FOR SELECT USING (true);

CREATE POLICY "Compliance can manage suspicious trades" ON suspicious_trades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('compliance', 'admin', 'risk_manager')
    )
  );

-- RLS Policies for risk_metrics
CREATE POLICY "Users can read all risk metrics" ON risk_metrics
  FOR SELECT USING (true);

CREATE POLICY "Risk managers can manage risk metrics" ON risk_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
    )
  );

-- RLS Policies for alert_rules
CREATE POLICY "Users can read alert rules" ON alert_rules
  FOR SELECT USING (true);

CREATE POLICY "Risk managers can manage alert rules" ON alert_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can read audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Users can read own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
  BEFORE UPDATE ON holdings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suspicious_trades_updated_at
  BEFORE UPDATE ON suspicious_trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at
  BEFORE UPDATE ON alert_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function for audit logging
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid()::text,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_portfolios
  AFTER INSERT OR UPDATE OR DELETE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_alerts
  AFTER INSERT OR UPDATE OR DELETE ON alerts
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();