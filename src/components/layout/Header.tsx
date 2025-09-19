import React from 'react';
import { Bell, Menu, Sun, Moon, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { mockAlerts } from '../../utils/mockData';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { profile } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);
  
  const activeAlerts = mockAlerts.filter(alert => alert.status === 'active');
  const highSeverityAlerts = activeAlerts.filter(alert => alert.severity === 'high');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 lg:hidden">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-4">
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  FinSmart
                </h1>
              </div>
            </div>
          </div>

          {/* Right side - Notifications and profile */}
          <div className="flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <Bell className="h-5 w-5" />
              </button>
              {activeAlerts.length > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                  <div className={`h-2 w-2 rounded-full ${
                    highSeverityAlerts.length > 0 ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  <div className={`absolute h-2 w-2 rounded-full animate-ping ${
                    highSeverityAlerts.length > 0 ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}