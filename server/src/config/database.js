/**
 * Database Configuration
 * Supabase client setup and connection management
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Use environment variables with fallbacks for demo
const supabaseUrl = process.env.SUPABASE_URL || 'https://rcurovgxikthkiniibez.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdXJvdmd4aWt0aGtpbmlpYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjkyOTcsImV4cCI6MjA3Mzg0NTI5N30.Ot1oOvU8nT8EqrW6bR5ZzSHWGUi0taMT3IcUMVn_zQ8';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Create Supabase client
const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
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
  supabaseUrl,
  supabaseServiceKey,
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