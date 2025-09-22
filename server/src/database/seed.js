/**
 * Database Seed Script
 * Populates database with sample data for development and testing
 */

const { supabaseAdmin } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Sample data
 */
const sampleData = {
  profiles: [
    {
      id: 'user_admin_001',
      email: 'admin@finsmart.com',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: 'user_risk_001',
      email: 'risk@finsmart.com',
      name: 'Risk Manager',
      role: 'risk_manager'
    },
    {
      id: 'user_trader_001',
      email: 'trader@finsmart.com',
      name: 'Senior Trader',
      role: 'trader'
    },
    {
      id: 'user_compliance_001',
      email: 'compliance@finsmart.com',
      name: 'Compliance Officer',
      role: 'compliance'
    }
  ],

  portfolios: [
    {
      id: 'port_001',
      name: 'Tech Growth Portfolio',
      client_id: 'client_001',
      client_name: 'Apex Capital',
      total_value: 12500000.00,
      var_1d: -187500.00,
      pnl_today: 125000.00,
      margin_utilization: 0.65,
      risk_level: 'high',
      user_id: 'user_risk_001'
    },
    {
      id: 'port_002',
      name: 'Diversified Equity',
      client_id: 'client_002',
      client_name: 'Sterling Investments',
      total_value: 8750000.00,
      var_1d: -131250.00,
      pnl_today: -45000.00,
      margin_utilization: 0.42,
      risk_level: 'medium',
      user_id: 'user_risk_001'
    },
    {
      id: 'port_003',
      name: 'Fixed Income Plus',
      client_id: 'client_003',
      client_name: 'Global Asset Management',
      total_value: 15200000.00,
      var_1d: -76000.00,
      pnl_today: 25000.00,
      margin_utilization: 0.28,
      risk_level: 'low',
      user_id: 'user_risk_001'
    }
  ],

  holdings: [
    // Tech Growth Portfolio holdings
    {
      id: 'hold_001',
      portfolio_id: 'port_001',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 50000,
      price: 185.25,
      value: 9262500.00,
      sector: 'Technology',
      asset_class: 'Equity',
      region: 'North America',
      weight_percent: 74.10
    },
    {
      id: 'hold_002',
      portfolio_id: 'port_001',
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      quantity: 8500,
      price: 378.90,
      value: 3220650.00,
      sector: 'Technology',
      asset_class: 'Equity',
      region: 'North America',
      weight_percent: 25.80
    },
    // Diversified Equity holdings
    {
      id: 'hold_003',
      portfolio_id: 'port_002',
      symbol: 'JPM',
      name: 'JPMorgan Chase',
      quantity: 25000,
      price: 165.80,
      value: 4145000.00,
      sector: 'Financials',
      asset_class: 'Equity',
      region: 'North America',
      weight_percent: 47.40
    },
    {
      id: 'hold_004',
      portfolio_id: 'port_002',
      symbol: 'JNJ',
      name: 'Johnson & Johnson',
      quantity: 28000,
      price: 164.50,
      value: 4606000.00,
      sector: 'Healthcare',
      asset_class: 'Equity',
      region: 'North America',
      weight_percent: 52.60
    },
    // Fixed Income Plus holdings
    {
      id: 'hold_005',
      portfolio_id: 'port_003',
      symbol: 'TLT',
      name: '20+ Year Treasury Bond ETF',
      quantity: 150000,
      price: 101.33,
      value: 15199500.00,
      sector: 'Government Bonds',
      asset_class: 'Fixed Income',
      region: 'North America',
      weight_percent: 100.00
    }
  ],

  alerts: [
    {
      id: 'alert_001',
      type: 'concentration_risk',
      title: 'High Technology Sector Concentration',
      description: 'Technology sector exposure (74.1%) exceeds threshold (70%)',
      severity: 'high',
      status: 'active',
      portfolio_id: 'port_001',
      threshold_value: 70.0,
      current_value: 74.1,
      created_by: 'user_risk_001'
    },
    {
      id: 'alert_002',
      type: 'var_breach',
      title: 'VaR Limit Breach',
      description: '1-day VaR (-$187,500) exceeds limit (-$150,000)',
      severity: 'medium',
      status: 'acknowledged',
      portfolio_id: 'port_001',
      threshold_value: -150000.0,
      current_value: -187500.0,
      created_by: 'user_risk_001',
      acknowledged_by: 'user_trader_001',
      acknowledged_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      id: 'alert_003',
      type: 'suspicious_trade',
      title: 'Suspicious Trading Activity',
      description: 'High volume spike detected in AAPL',
      severity: 'high',
      status: 'active',
      portfolio_id: 'port_001',
      created_by: 'user_compliance_001'
    }
  ],

  suspicious_trades: [
    {
      id: 'trade_001',
      portfolio_id: 'port_001',
      portfolio_name: 'Tech Growth Portfolio',
      symbol: 'AAPL',
      trade_type: 'volume_spike',
      severity: 'high',
      amount: 5250000.00,
      description: 'Unusual volume spike detected - 500% above 30-day average',
      status: 'new',
      reported_by: 'user_compliance_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
    },
    {
      id: 'trade_002',
      portfolio_id: 'port_002',
      portfolio_name: 'Diversified Equity',
      symbol: 'JPM',
      trade_type: 'off_market_price',
      severity: 'medium',
      amount: 850000.00,
      description: 'Trade executed 3.2% below market price',
      status: 'investigating',
      assigned_to: 'compliance@finsmart.com',
      assigned_by: 'user_risk_001',
      assigned_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      reported_by: 'user_compliance_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45 minutes ago
    },
    {
      id: 'trade_003',
      portfolio_id: 'port_001',
      portfolio_name: 'Tech Growth Portfolio',
      symbol: 'MSFT',
      trade_type: 'wash_trade',
      severity: 'low',
      amount: 320000.00,
      description: 'Potential wash trading pattern detected',
      status: 'resolved',
      assigned_to: 'risk@finsmart.com',
      assigned_by: 'user_risk_001',
      assigned_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reported_by: 'user_compliance_001',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
    }
  ],

  risk_metrics: [
    {
      id: 'risk_001',
      portfolio_id: 'port_001',
      var_1d: -187500.00,
      var_5d: -425000.00,
      expected_shortfall: -312000.00,
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
    },
    {
      id: 'risk_002',
      portfolio_id: 'port_002',
      var_1d: -131250.00,
      var_5d: -298000.00,
      expected_shortfall: -218000.00,
      beta: 1.12,
      sharpe_ratio: 1.45,
      max_drawdown: -0.12,
      sector_concentration: {
        'Financials': 47.4,
        'Healthcare': 52.6
      },
      geographic_exposure: {
        'North America': 100.0
      },
      currency_exposure: {
        'USD': 100.0
      },
      timestamp: new Date().toISOString()
    },
    {
      id: 'risk_003',
      portfolio_id: 'port_003',
      var_1d: -76000.00,
      var_5d: -172000.00,
      expected_shortfall: -126000.00,
      beta: 0.25,
      sharpe_ratio: 0.85,
      max_drawdown: -0.05,
      sector_concentration: {
        'Government Bonds': 100.0
      },
      geographic_exposure: {
        'North America': 100.0
      },
      currency_exposure: {
        'USD': 100.0
      },
      timestamp: new Date().toISOString()
    }
  ]
};

/**
 * Seed database with sample data
 */
async function seedDatabase() {
  logger.info('Starting database seeding...');

  try {
    logger.info('Skipping data clearing for demo - inserting sample data...');

    // Insert sample data (in correct order due to foreign keys)
    const insertOrder = ['profiles', 'portfolios', 'holdings', 'alerts', 'suspicious_trades', 'risk_metrics'];

    for (const table of insertOrder) {
      const data = sampleData[table];
      if (data && data.length > 0) {
        logger.info(`Inserting ${data.length} records into ${table}...`);
        
        try {
          const { error } = await supabaseAdmin
            .from(table)
            .upsert(data, { onConflict: 'id' });

          if (error) {
            logger.warn(`Warning inserting into ${table}:`, error.message);
            // Continue with other tables even if one fails
          } else {
            logger.info(`Successfully inserted data into ${table}`);
          }
        } catch (insertError) {
          logger.warn(`Could not insert into ${table}:`, insertError.message);
        }
      }
    }

    logger.info('Database seeding completed successfully!');
    
    // Log summary
    logger.info('Seeded data summary:');
    for (const [table, data] of Object.entries(sampleData)) {
      logger.info(`  ${table}: ${data.length} records`);
    }

  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  }
}

/**
 * Verify seeded data
 */
async function verifySeededData() {
  logger.info('Verifying seeded data...');

  try {
    for (const table of Object.keys(sampleData)) {
      try {
        const { count, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          logger.warn(`Could not verify ${table}:`, error.message);
          continue;
        }

        logger.info(`${table}: ${count || 0} records found`);
      } catch (verifyError) {
        logger.warn(`Could not verify ${table}:`, verifyError.message);
      }
    }

    logger.info('Data verification completed');
  } catch (error) {
    logger.error('Data verification failed:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => verifySeededData())
    .catch((error) => {
      logger.error('Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  verifySeededData,
  sampleData
};