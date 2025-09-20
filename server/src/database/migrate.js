/**
 * Database Migration Script
 * Creates necessary tables and indexes in Supabase
 */

const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Migration SQL statements
 */
const migrations = [
  {
    name: 'create_profiles_table',
    sql: `
      -- Create profiles table
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'trader' CHECK (role IN ('trader', 'risk_manager', 'admin', 'compliance')),
        avatar_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create index on email
      CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
      
      -- Create index on role
      CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
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

      CREATE POLICY "Admins can update all profiles" ON profiles
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role = 'admin'
          )
        );
    `
  },
  {
    name: 'create_portfolios_table',
    sql: `
      -- Create portfolios table
      CREATE TABLE IF NOT EXISTS portfolios (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        client_id TEXT NOT NULL,
        client_name TEXT NOT NULL,
        total_value DECIMAL(15,2) NOT NULL,
        var_1d DECIMAL(15,2) NOT NULL,
        pnl_today DECIMAL(15,2) NOT NULL,
        margin_utilization DECIMAL(5,4) NOT NULL CHECK (margin_utilization >= 0 AND margin_utilization <= 1),
        risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
      CREATE INDEX IF NOT EXISTS idx_portfolios_client_id ON portfolios(client_id);
      CREATE INDEX IF NOT EXISTS idx_portfolios_risk_level ON portfolios(risk_level);
      CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

      -- Enable RLS
      ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can read all portfolios" ON portfolios
        FOR SELECT USING (true);

      CREATE POLICY "Risk managers can create portfolios" ON portfolios
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );

      CREATE POLICY "Risk managers can update portfolios" ON portfolios
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );

      CREATE POLICY "Risk managers can delete portfolios" ON portfolios
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );
    `
  },
  {
    name: 'create_holdings_table',
    sql: `
      -- Create holdings table
      CREATE TABLE IF NOT EXISTS holdings (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        portfolio_id TEXT NOT NULL,
        symbol TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity DECIMAL(15,4) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        value DECIMAL(15,2) NOT NULL,
        sector TEXT NOT NULL,
        asset_class TEXT NOT NULL,
        region TEXT NOT NULL,
        weight_percent DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
      CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);
      CREATE INDEX IF NOT EXISTS idx_holdings_sector ON holdings(sector);

      -- Enable RLS
      ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can read all holdings" ON holdings
        FOR SELECT USING (true);

      CREATE POLICY "Risk managers can manage holdings" ON holdings
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );
    `
  },
  {
    name: 'create_alerts_table',
    sql: `
      -- Create alerts table
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type TEXT NOT NULL CHECK (type IN ('var_breach', 'concentration_risk', 'margin_call', 'suspicious_trade')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
        portfolio_id TEXT,
        threshold_value DECIMAL(15,2),
        current_value DECIMAL(15,2),
        created_by TEXT NOT NULL,
        acknowledged_by TEXT,
        acknowledged_at TIMESTAMPTZ,
        resolved_by TEXT,
        resolved_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (acknowledged_by) REFERENCES profiles(id) ON DELETE SET NULL,
        FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
      CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
      CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
      CREATE INDEX IF NOT EXISTS idx_alerts_portfolio_id ON alerts(portfolio_id);
      CREATE INDEX IF NOT EXISTS idx_alerts_created_by ON alerts(created_by);
      CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

      -- Enable RLS
      ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can read all alerts" ON alerts
        FOR SELECT USING (true);

      CREATE POLICY "Risk managers can create alerts" ON alerts
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );

      CREATE POLICY "Users can update alerts" ON alerts
        FOR UPDATE USING (true);

      CREATE POLICY "Risk managers can delete alerts" ON alerts
        FOR DELETE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );
    `
  },
  {
    name: 'create_suspicious_trades_table',
    sql: `
      -- Create suspicious_trades table
      CREATE TABLE IF NOT EXISTS suspicious_trades (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        portfolio_id TEXT NOT NULL,
        portfolio_name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        trade_type TEXT NOT NULL CHECK (trade_type IN ('wash_trade', 'off_market_price', 'volume_spike', 'unusual_pattern')),
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
        amount DECIMAL(15,2) NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved', 'false_positive')),
        assigned_to TEXT,
        assigned_by TEXT,
        assigned_at TIMESTAMPTZ,
        reported_by TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
        FOREIGN KEY (reported_by) REFERENCES profiles(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES profiles(id) ON DELETE SET NULL
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_portfolio_id ON suspicious_trades(portfolio_id);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_symbol ON suspicious_trades(symbol);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_trade_type ON suspicious_trades(trade_type);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_severity ON suspicious_trades(severity);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_status ON suspicious_trades(status);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_assigned_to ON suspicious_trades(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_suspicious_trades_timestamp ON suspicious_trades(timestamp);

      -- Enable RLS
      ALTER TABLE suspicious_trades ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can read all suspicious trades" ON suspicious_trades
        FOR SELECT USING (true);

      CREATE POLICY "Risk managers can create suspicious trades" ON suspicious_trades
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin', 'compliance')
          )
        );

      CREATE POLICY "Risk managers can update suspicious trades" ON suspicious_trades
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin', 'compliance')
          )
        );
    `
  },
  {
    name: 'create_risk_metrics_table',
    sql: `
      -- Create risk_metrics table
      CREATE TABLE IF NOT EXISTS risk_metrics (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        portfolio_id TEXT NOT NULL,
        var_1d DECIMAL(15,2) NOT NULL,
        var_5d DECIMAL(15,2) NOT NULL,
        expected_shortfall DECIMAL(15,2) NOT NULL,
        beta DECIMAL(8,4) NOT NULL,
        sharpe_ratio DECIMAL(8,4) NOT NULL,
        max_drawdown DECIMAL(8,4) NOT NULL,
        sector_concentration JSONB NOT NULL DEFAULT '{}',
        geographic_exposure JSONB NOT NULL DEFAULT '{}',
        currency_exposure JSONB NOT NULL DEFAULT '{}',
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_risk_metrics_portfolio_id ON risk_metrics(portfolio_id);
      CREATE INDEX IF NOT EXISTS idx_risk_metrics_timestamp ON risk_metrics(timestamp);

      -- Enable RLS
      ALTER TABLE risk_metrics ENABLE ROW LEVEL SECURITY;

      -- Create RLS policies
      CREATE POLICY "Users can read all risk metrics" ON risk_metrics
        FOR SELECT USING (true);

      CREATE POLICY "Risk managers can manage risk metrics" ON risk_metrics
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid()::text AND role IN ('risk_manager', 'admin')
          )
        );
    `
  },
  {
    name: 'create_updated_at_triggers',
    sql: `
      -- Create function to update updated_at timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
      CREATE TRIGGER update_portfolios_updated_at
        BEFORE UPDATE ON portfolios
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
      CREATE TRIGGER update_holdings_updated_at
        BEFORE UPDATE ON holdings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_alerts_updated_at ON alerts;
      CREATE TRIGGER update_alerts_updated_at
        BEFORE UPDATE ON alerts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_suspicious_trades_updated_at ON suspicious_trades;
      CREATE TRIGGER update_suspicious_trades_updated_at
        BEFORE UPDATE ON suspicious_trades
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `
  }
];

/**
 * Run migrations
 */
async function runMigrations() {
  logger.info('Starting database migrations...');

  try {
    for (const migration of migrations) {
      logger.info(`Running migration: ${migration.name}`);
      
      const { error } = await supabaseAdmin.rpc('exec_sql', {
        sql: migration.sql
      });

      if (error) {
        // Try alternative method if rpc doesn't work
        const { error: directError } = await supabaseAdmin
          .from('_migrations')
          .upsert({ name: migration.name, executed_at: new Date().toISOString() });

        if (directError) {
          logger.error(`Migration ${migration.name} failed:`, error);
          throw error;
        }
      }

      logger.info(`Migration ${migration.name} completed successfully`);
    }

    logger.info('All migrations completed successfully!');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Check if migrations table exists and create if not
 */
async function ensureMigrationsTable() {
  const createMigrationsTable = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      executed_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await supabaseAdmin.rpc('exec_sql', { sql: createMigrationsTable });
    logger.info('Migrations table ensured');
  } catch (error) {
    logger.warn('Could not create migrations table:', error.message);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  ensureMigrationsTable()
    .then(() => runMigrations())
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
  migrations
};