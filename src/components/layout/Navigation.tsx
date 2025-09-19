import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  Settings, 
  LogOut,
  X,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavigationProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Navigation({ mobile = false, onClose }: NavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Portfolios', href: '/portfolios', icon: TrendingUp },
    { name: 'Risk Analysis', href: '/risk-analysis', icon: Shield },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Suspicious Trades', href: '/suspicious-trades', icon: Activity },
  ];

  const adminItems = [
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    if (mobile && onClose) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
            FinSmart
          </span>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {profile?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {profile?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-300'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </button>
          );
        })}

        {/* Admin section */}
        <div className="pt-6">
          <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Settings
          </p>
        </div>
        {adminItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive
                    ? 'text-blue-500 dark:text-blue-300'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full group flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
          Sign out
        </button>
      </div>
    </div>
  );
}