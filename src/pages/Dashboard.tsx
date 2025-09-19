import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Activity,
  Shield,
  Users,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockPortfolios, mockAlerts, mockSuspiciousTrades, generateRealTimeUpdate } from '../utils/mockData';
import type { Portfolio, Alert } from '../types';

export function Dashboard() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(mockPortfolios);
  const [alerts] = useState<Alert[]>(mockAlerts);
  
  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolios(prevPortfolios =>
        prevPortfolios.map(portfolio => ({
          ...portfolio,
          ...generateRealTimeUpdate(portfolio)
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate aggregate metrics
  const totalValue = portfolios.reduce((sum, p) => sum + p.total_value, 0);
  const totalPnL = portfolios.reduce((sum, p) => sum + p.pnl_today, 0);
  const totalVaR = portfolios.reduce((sum, p) => sum + Math.abs(p.var_1d), 0);
  const avgMarginUtilization = portfolios.reduce((sum, p) => sum + p.margin_utilization, 0) / portfolios.length;
  
  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const highRiskPortfolios = portfolios.filter(p => p.risk_level === 'high').length;
  const suspiciousTradesCount = mockSuspiciousTrades.filter(trade => trade.status === 'new').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Real-time portfolio risk monitoring and analysis
        </p>
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                <span className="font-medium">{activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}</span> requiring attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total AUM</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalValue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total VaR (1D)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(totalVaR)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Margin</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercent(avgMarginUtilization)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Alerts</p>
                <p className="text-3xl font-bold text-red-600">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">High Risk Portfolios</p>
                <p className="text-3xl font-bold text-amber-600">{highRiskPortfolios}</p>
              </div>
              <Users className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspicious Trades</p>
                <p className="text-3xl font-bold text-orange-600">{suspiciousTradesCount}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Cards */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Portfolio Performance</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolios.map((portfolio) => (
              <div key={portfolio.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {portfolio.name}
                    </h4>
                    <Badge variant={
                      portfolio.risk_level === 'high' ? 'danger' :
                      portfolio.risk_level === 'medium' ? 'warning' : 'success'
                    }>
                      {portfolio.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{portfolio.client_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.total_value)}
                  </p>
                  <p className={`text-xs ${portfolio.pnl_today >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {portfolio.pnl_today >= 0 ? '+' : ''}{formatCurrency(portfolio.pnl_today)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Alerts</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0">
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.severity === 'high' ? 'text-red-500' :
                    alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {alert.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={
                  alert.severity === 'high' ? 'danger' :
                  alert.severity === 'medium' ? 'warning' : 'info'
                }>
                  {alert.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}