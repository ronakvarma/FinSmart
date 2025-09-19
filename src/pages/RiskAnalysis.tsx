import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { mockPortfolios, mockRiskMetrics } from '../utils/mockData';
import { BarChart3, TrendingDown, AlertTriangle } from 'lucide-react';

export function RiskAnalysis() {
  const [selectedPortfolio, setSelectedPortfolio] = useState('all');
  const [timeRange, setTimeRange] = useState('1d');

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

  // Get risk metrics for selected portfolio or aggregate
  const getRiskMetrics = () => {
    if (selectedPortfolio === 'all') {
      // Aggregate metrics across all portfolios
      const totalValue = mockPortfolios.reduce((sum, p) => sum + p.total_value, 0);
      const totalVaR = mockPortfolios.reduce((sum, p) => sum + Math.abs(p.var_1d), 0);
      
      return {
        var_1d: -totalVaR,
        var_5d: -totalVaR * 1.8,
        expected_shortfall: -totalVaR * 1.4,
        beta: 1.25,
        sharpe_ratio: 1.68,
        max_drawdown: -0.15,
        sector_concentration: {
          'Technology': 45.2,
          'Healthcare': 18.5,
          'Financials': 16.8,
          'Consumer Discretionary': 12.3,
          'Government Bonds': 7.2
        },
        geographic_exposure: {
          'North America': 82.3,
          'Europe': 12.1,
          'Asia Pacific': 5.6
        },
        currency_exposure: {
          'USD': 85.2,
          'EUR': 8.3,
          'JPY': 6.5
        }
      };
    } else {
      return mockRiskMetrics.find(m => m.portfolio_id === selectedPortfolio) || mockRiskMetrics[0];
    }
  };

  const riskMetrics = getRiskMetrics();

  // Concentration risk analysis
  const getConcentrationRisks = () => {
    const risks = [];
    
    // Check sector concentration
    Object.entries(riskMetrics.sector_concentration).forEach(([sector, percentage]) => {
      if (percentage > 30) {
        risks.push({
          type: 'Sector Concentration',
          asset: sector,
          percentage: percentage,
          threshold: 30,
          severity: percentage > 50 ? 'high' : percentage > 40 ? 'medium' : 'low'
        });
      }
    });

    // Check geographic concentration
    Object.entries(riskMetrics.geographic_exposure).forEach(([region, percentage]) => {
      if (percentage > 75) {
        risks.push({
          type: 'Geographic Concentration',
          asset: region,
          percentage: percentage,
          threshold: 75,
          severity: percentage > 90 ? 'high' : percentage > 85 ? 'medium' : 'low'
        });
      }
    });

    return risks;
  };

  const concentrationRisks = getConcentrationRisks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Analysis</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comprehensive risk metrics and concentration analysis
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Portfolio
              </label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Portfolios</option>
                {mockPortfolios.map(portfolio => (
                  <option key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1d">1 Day</option>
                <option value="5d">5 Days</option>
                <option value="1m">1 Month</option>
                <option value="3m">3 Months</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">VaR (1D)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(riskMetrics.var_1d)}
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Shortfall</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(riskMetrics.expected_shortfall)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Beta</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskMetrics.beta.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingDown className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskMetrics.sharpe_ratio.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Concentration Risk Alerts */}
      {concentrationRisks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Concentration Risk Alerts
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {concentrationRisks.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {risk.type}: {risk.asset}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    Current: {risk.percentage.toFixed(1)}% | Threshold: {risk.threshold}%
                  </p>
                </div>
                <Badge variant="danger">
                  {risk.severity.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exposure Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Concentration */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Sector Exposure</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(riskMetrics.sector_concentration).map(([sector, percentage]) => (
              <div key={sector}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{sector}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage > 40 ? 'bg-red-500' :
                      percentage > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Geographic Exposure */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Geographic Exposure</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(riskMetrics.geographic_exposure).map(([region, percentage]) => (
              <div key={region}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{region}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage > 80 ? 'bg-red-500' :
                      percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Currency Exposure */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Currency Exposure</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(riskMetrics.currency_exposure).map(([currency, percentage]) => (
              <div key={currency}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{currency}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      percentage > 80 ? 'bg-red-500' :
                      percentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Risk Summary</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">VaR Progression</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">1-Day VaR</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(riskMetrics.var_1d)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">5-Day VaR</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(riskMetrics.var_5d)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Performance Metrics</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Max Drawdown</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatPercent(riskMetrics.max_drawdown)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {riskMetrics.sharpe_ratio.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Risk Level</p>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  Math.abs(riskMetrics.var_1d) > 200000 ? 'danger' :
                  Math.abs(riskMetrics.var_1d) > 100000 ? 'warning' : 'success'
                }>
                  {Math.abs(riskMetrics.var_1d) > 200000 ? 'HIGH RISK' :
                   Math.abs(riskMetrics.var_1d) > 100000 ? 'MEDIUM RISK' : 'LOW RISK'}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on current VaR levels and concentration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}