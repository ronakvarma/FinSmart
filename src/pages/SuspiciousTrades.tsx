import React, { useState } from 'react';
import { Search, Filter, Eye, AlertTriangle, Clock, CheckCircle, FileText, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockSuspiciousTrades } from '../utils/mockData';
import type { SuspiciousTrade } from '../types';

export function SuspiciousTrades() {
  const [trades, setTrades] = useState<SuspiciousTrade[]>(mockSuspiciousTrades);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'investigating' | 'resolved' | 'false_positive'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedTrade, setSelectedTrade] = useState<SuspiciousTrade | null>(null);

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.portfolio_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || trade.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleStatusChange = (tradeId: string, newStatus: SuspiciousTrade['status']) => {
    setTrades(prevTrades =>
      prevTrades.map(trade =>
        trade.id === tradeId
          ? { ...trade, status: newStatus }
          : trade
      )
    );
  };

  const getTradeTypeLabel = (type: SuspiciousTrade['trade_type']) => {
    switch (type) {
      case 'wash_trade':
        return 'Wash Trade';
      case 'off_market_price':
        return 'Off-Market Price';
      case 'volume_spike':
        return 'Volume Spike';
      case 'unusual_pattern':
        return 'Unusual Pattern';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: SuspiciousTrade['status']) => {
    switch (status) {
      case 'new':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'investigating':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'false_positive':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  // Count trades by status
  const newCount = trades.filter(t => t.status === 'new').length;
  const investigatingCount = trades.filter(t => t.status === 'investigating').length;
  const resolvedCount = trades.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suspicious Trades</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Monitor and investigate unusual trading patterns and anomalies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{trades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">New</p>
                <p className="text-2xl font-bold text-red-600">{newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Investigating</p>
                <p className="text-2xl font-bold text-amber-600">{investigatingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Resolved</p>
                <p className="text-2xl font-bold text-emerald-600">{resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search trades by symbol, portfolio, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Severities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trades List */}
      <div className="space-y-4">
        {filteredTrades.map((trade) => (
          <Card 
            key={trade.id} 
            className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
              trade.severity === 'high' ? 'border-l-red-500' :
              trade.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
            }`}
            onClick={() => setSelectedTrade(trade)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {trade.symbol} - {getTradeTypeLabel(trade.trade_type)}
                    </h3>
                    <Badge variant={
                      trade.severity === 'high' ? 'danger' :
                      trade.severity === 'medium' ? 'warning' : 'info'
                    }>
                      {trade.severity.toUpperCase()}
                    </Badge>
                    <div className="flex items-center">
                      {getStatusIcon(trade.status)}
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {trade.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {trade.description}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Portfolio:</span>
                      <p className="text-gray-900 dark:text-white">{trade.portfolio_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Amount:</span>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(trade.amount)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Time:</span>
                      <p className="text-gray-900 dark:text-white">{formatDateTime(trade.timestamp)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Assigned:</span>
                      <p className="text-gray-900 dark:text-white">
                        {trade.assigned_to || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrade(trade);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {trade.status === 'new' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(trade.id, 'investigating');
                      }}
                    >
                      Investigate
                    </Button>
                  )}
                  
                  {trade.status === 'investigating' && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(trade.id, 'resolved');
                        }}
                      >
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(trade.id, 'false_positive');
                        }}
                      >
                        False Positive
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trade Detail Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Trade Investigation Details
              </h2>
              <button
                onClick={() => setSelectedTrade(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Symbol</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTrade.symbol}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Trade Type</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getTradeTypeLabel(selectedTrade.trade_type)}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  {selectedTrade.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedTrade.amount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatDateTime(selectedTrade.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedTrade.portfolio_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedTrade.assigned_to || 'Unassigned'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedTrade.status)}
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    Status: {selectedTrade.status.replace('_', ' ')}
                  </span>
                </div>
                <Badge variant={
                  selectedTrade.severity === 'high' ? 'danger' :
                  selectedTrade.severity === 'medium' ? 'warning' : 'info'
                }>
                  {selectedTrade.severity.toUpperCase()} PRIORITY
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTrades.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <FileText className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No suspicious trades found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No trades match your current filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}