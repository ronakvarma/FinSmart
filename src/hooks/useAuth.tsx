import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { User as AppUser } from '../types';

interface AuthContextType {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name: string, role: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, simulate authentication
    const initAuth = async () => {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user is already logged in (localStorage for demo)
      const savedUser = localStorage.getItem('finsmart-user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData.user);
        setProfile(userData.profile);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Demo authentication - accept any email/password
      if (email && password) {
        const mockUser = {
          id: '1',
          email: email,
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {}
        } as User;

        const mockProfile: AppUser = {
          id: '1',
          email: email,
          name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          role: 'risk_manager',
          created_at: new Date().toISOString()
        };

        setUser(mockUser);
        setProfile(mockProfile);
        
        // Save to localStorage for demo persistence
        localStorage.setItem('finsmart-user', JSON.stringify({
          user: mockUser,
          profile: mockProfile
        }));

        return { error: null };
      } else {
        return { error: { message: 'Please enter valid credentials' } };
      }
    } catch (error) {
      return { error: { message: 'Authentication failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: string) => {
    try {
      setLoading(true);
      
      const mockUser = {
        id: '1',
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {}
      } as User;

      const mockProfile: AppUser = {
        id: '1',
        email: email,
        name: name,
        role: role as AppUser['role'],
        created_at: new Date().toISOString()
      };

      setUser(mockUser);
      setProfile(mockProfile);
      
      localStorage.setItem('finsmart-user', JSON.stringify({
        user: mockUser,
        profile: mockProfile
      }));

      return { error: null };
    } catch (error) {
      return { error: { message: 'Registration failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('finsmart-user');
    setLoading(false);
  };

  const authContextValue: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}