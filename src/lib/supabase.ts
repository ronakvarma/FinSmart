import { createClient } from '@supabase/supabase-js';

// Use the same Supabase instance as the backend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcurovgxikthkiniibez.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjdXJvdmd4aWt0aGtpbmlpYmV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjkyOTcsImV4cCI6MjA3Mzg0NTI5N30.Ot1oOvU8nT8EqrW6bR5ZzSHWGUi0taMT3IcUMVn_zQ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          avatar_url: string | null;
          preferences: any;
          last_login: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string;
          avatar_url?: string | null;
          preferences?: any;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          avatar_url?: string | null;
          preferences?: any;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      portfolios: {
        Row: {
          id: string;
          name: string;
          client_id: string;
          client_name: string;
          total_value: number;
          var_1d: number;
          var_5d: number;
          pnl_today: number;
          pnl_mtd: number;
          pnl_ytd: number;
          margin_utilization: number;
          risk_level: string;
          benchmark: string;
          currency: string;
          status: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          client_id: string;
          client_name: string;
          total_value: number;
          var_1d: number;
          var_5d: number;
          pnl_today: number;
          pnl_mtd: number;
          pnl_ytd: number;
          margin_utilization: number;
          risk_level: string;
          benchmark?: string;
          currency?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          client_id?: string;
          client_name?: string;
          total_value?: number;
          var_1d?: number;
          var_5d?: number;
          pnl_today?: number;
          pnl_mtd?: number;
          pnl_ytd?: number;
          margin_utilization?: number;
          risk_level?: string;
          benchmark?: string;
          currency?: string;
          status?: string;
          updated_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          portfolio_id: string;
          symbol: string;
          name: string;
          quantity: number;
          price: number;
          market_value: number;
          cost_basis: number;
          unrealized_pnl: number;
          sector: string;
          asset_class: string;
          region: string;
          weight_percent: number;
          beta: number | null;
          dividend_yield: number | null;
          pe_ratio: number | null;
          last_updated: string;
          created_at: string;
          updated_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          type: string;
          title: string;
          description: string;
          severity: string;
          status: string;
          portfolio_id: string | null;
          threshold_value: number | null;
          current_value: number | null;
          metadata: any;
          created_by: string;
          acknowledged_by: string | null;
          acknowledged_at: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      suspicious_trades: {
        Row: {
          id: string;
          portfolio_id: string;
          portfolio_name: string;
          symbol: string;
          trade_type: string;
          severity: string;
          amount: number;
          trade_price: number | null;
          market_price: number | null;
          volume: number | null;
          description: string;
          detection_algorithm: string | null;
          confidence_score: number;
          status: string;
          priority: number;
          assigned_to: string | null;
          assigned_by: string | null;
          assigned_at: string | null;
          investigation_notes: string | null;
          resolution_notes: string | null;
          reported_by: string;
          trade_timestamp: string;
          created_at: string;
          updated_at: string;
        };
      };
      risk_metrics: {
        Row: {
          id: string;
          portfolio_id: string;
          calculation_date: string;
          var_1d: number;
          var_5d: number;
          var_1m: number;
          expected_shortfall: number;
          beta: number;
          alpha: number | null;
          sharpe_ratio: number;
          sortino_ratio: number;
          max_drawdown: number;
          volatility: number;
          tracking_error: number;
          information_ratio: number;
          sector_concentration: any;
          geographic_exposure: any;
          currency_exposure: any;
          asset_class_exposure: any;
          top_holdings: any;
          correlation_matrix: any;
          stress_test_results: any;
          timestamp: string;
          created_at: string;
        };
      };
    };
  };
};