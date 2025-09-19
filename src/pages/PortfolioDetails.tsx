import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockPortfolios } from '../utils/mockData';
import type { Portfolio, Holding } from '../types';

export function PortfolioDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'risk' | 'alerts'>('overview');
  
  const portfolio = mockPortfolios.find(p => p.id === id);

  if (!portfolio) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Portfolio not found</h2>
        <Button onClick={() => navigate('/portfolios')} className="mt-4">
          Back to Portfolios
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSectorBreakdown = (holdings: Holding[]) => {
    const sectors = holdings.reduce((acc, holding) => {
      if (!acc[holding.sector]) {
        acc[holding.sector] = 0;
      }
      acc[holding.sector] += holding.weight_percent;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(sectors).map(([sector, percentage]) => ({
      sector,
      percentage
    }));
  };

  const sectorBreakdown = getSectorBreakdown(portfolio.holdings);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/portfolios')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{portfolio.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{portfolio.client_name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={
            portfolio.risk_level === 'high' ? 'danger' :
            portfolio.risk_level === 'medium' ? 'warning' : 'success'
          }>
            {portfolio.risk_level.toUpperCase()} RISK
          </Badge>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(portfolio.total_value)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {portfolio.pnl_today >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Daily P&L</p>
                <p className={`text-2xl font-bold ${portfolio.pnl_today >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {portfolio.pnl_today >= 0 ? '+' : ''}{formatCurrency(portfolio.pnl_today)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">VaR (1D)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  -{formatCurrency(Math.abs(portfolio.var_1d))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 text-xs font-bold">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Margin Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPercent(portfolio.margin_utilization * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'holdings', label: 'Holdings' },
            { key: 'risk', label: 'Risk Analysis' },
            { key: 'alerts', label: 'Alerts' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Breakdown */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sector Allocation</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectorBreakdown.map(({ sector, percentage }) => (
                <div key={sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{sector}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatPercent(percentage)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance Summary</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Holdings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{portfolio.holdings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(portfolio.last_updated).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Margin Utilization</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercent(portfolio.margin_utilization * 100)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      portfolio.margin_utilization > 0.8 ? 'bg-red-500' :
                      portfolio.margin_utilization > 0.6 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${portfolio.margin_utilization * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'holdings' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Holdings Details</h3>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Symbol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Sector
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {portfolio.holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {holding.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {holding.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {holding.quantity.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${holding.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(holding.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPercent(holding.weight_percent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {holding.sector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'risk' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Risk Metrics</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">1-Day VaR</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    -{formatCurrency(Math.abs(portfolio.var_1d))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Risk Level</p>
                  <Badge variant={
                    portfolio.risk_level === 'high' ? 'danger' :
                    portfolio.risk_level === 'medium' ? 'warning' : 'success'
                  }>
                    {portfolio.risk_level.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Concentration Analysis</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Largest sector exposure: {sectorBreakdown[0]?.sector} ({formatPercent(sectorBreakdown[0]?.percentage || 0)})
              </p>
              {sectorBreakdown[0]?.percentage > 30 && (
                <div className="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-3">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <div className="ml-3">
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        High concentration risk detected in {sectorBreakdown[0].sector} sector
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Portfolio Alerts</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No active alerts for this portfolio
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}