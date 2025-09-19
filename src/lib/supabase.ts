import { createClient } from '@supabase/supabase-js';

// For demo purposes, we'll use placeholder values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';

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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: string;
          avatar_url?: string | null;
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
          pnl_today: number;
          margin_utilization: number;
          risk_level: string;
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
          pnl_today: number;
          margin_utilization: number;
          risk_level: string;
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
          pnl_today?: number;
          margin_utilization?: number;
          risk_level?: string;
          updated_at?: string;
        };
      };
    };
  };
};