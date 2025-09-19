import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockPortfolios } from '../utils/mockData';
import type { Portfolio } from '../types';

export function Portfolios() {
  const navigate = useNavigate();
  const [portfolios] = useState<Portfolio[]>(mockPortfolios);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter portfolios based on search and risk level
  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         portfolio.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRiskLevel = selectedRiskLevel === 'all' || portfolio.risk_level === selectedRiskLevel;
    
    return matchesSearch && matchesRiskLevel;
  });

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

  const PortfolioCard = ({ portfolio }: { portfolio: Portfolio }) => (
    <Card hover className="cursor-pointer transition-all duration-200" onClick={() => navigate(`/portfolios/${portfolio.id}`)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {portfolio.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {portfolio.client_name}
            </p>
          </div>
          <Badge variant={
            portfolio.risk_level === 'high' ? 'danger' :
            portfolio.risk_level === 'medium' ? 'warning' : 'success'
          }>
            {portfolio.risk_level.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {/* Total Value */}
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(portfolio.total_value)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                {portfolio.pnl_today >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  portfolio.pnl_today >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {portfolio.pnl_today >= 0 ? '+' : ''}{formatCurrency(portfolio.pnl_today)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Daily P&L</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                -{formatCurrency(Math.abs(portfolio.var_1d))}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">VaR (1D)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatPercent(portfolio.margin_utilization)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Margin Used</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {portfolio.holdings.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Holdings</p>
            </div>
          </div>

          {/* Margin Utilization Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Margin Utilization</span>
              <span>{formatPercent(portfolio.margin_utilization)}</span>
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
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portfolios</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor your investment portfolios
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Portfolio
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search portfolios or clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Risk Level Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedRiskLevel}
                onChange={(e) => setSelectedRiskLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm font-medium ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredPortfolios.length} of {portfolios.length} portfolios
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Low Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">High Risk</span>
          </div>
        </div>
      </div>

      {/* Portfolio Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Portfolio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Daily P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    VaR (1D)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPortfolios.map((portfolio) => (
                  <tr 
                    key={portfolio.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigate(`/portfolios/${portfolio.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {portfolio.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {portfolio.client_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(portfolio.total_value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        portfolio.pnl_today >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {portfolio.pnl_today >= 0 ? '+' : ''}{formatCurrency(portfolio.pnl_today)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      -{formatCurrency(Math.abs(portfolio.var_1d))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPercent(portfolio.margin_utilization)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={
                        portfolio.risk_level === 'high' ? 'danger' :
                        portfolio.risk_level === 'medium' ? 'warning' : 'success'
                      }>
                        {portfolio.risk_level.toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredPortfolios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <TrendingUp className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No portfolios found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
            <div className="mt-6">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}