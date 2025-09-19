import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { mockAlerts } from '../../utils/mockData';

export function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeAlerts = mockAlerts.filter(alert => alert.status === 'active');

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Portfolios', href: '/portfolios', icon: TrendingUp },
    { name: 'Risk', href: '/risk-analysis', icon: Shield },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle, badge: activeAlerts.length },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-pb">
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`flex flex-col items-center justify-center py-2 px-1 relative transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
              {item.badge && item.badge > 0 && (
                <div className="absolute top-0 right-2 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {item.badge}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}