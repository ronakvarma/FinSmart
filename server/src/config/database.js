/**
 * Database Configuration
 * Supabase client setup and connection management
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Create admin client for server-side operations
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      logger.warn('Database connection test failed:', error.message);
      return false;
    }
    
    logger.info('✅ Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection error:', error.message);
    return false;
  }
};

/**
 * Execute raw SQL query (admin only)
 */
const executeQuery = async (query, params = []) => {
  try {
    const { data, error } = await supabaseAdmin.rpc('execute_sql', {
      query,
      params
    });
    
    if (error) {
      logger.error('Query execution error:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    logger.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Get database statistics
 */
const getDatabaseStats = async () => {
  try {
    const stats = {};
    
    // Get table counts
    const tables = ['profiles', 'portfolios', 'alerts', 'suspicious_trades'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        stats[table] = count;
      }
    }
    
    return stats;
  } catch (error) {
    logger.error('Error getting database stats:', error.message);
    return {};
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  testConnection,
  executeQuery,
  getDatabaseStats
};