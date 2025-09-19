import React, { useState } from 'react';
import { AlertTriangle, Bell, Clock, CheckCircle, X, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { mockAlerts } from '../utils/mockData';
import type { Alert } from '../types';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredAlerts = alerts.filter(alert => {
    const statusMatch = filter === 'all' || alert.status === filter;
    const severityMatch = severityFilter === 'all' || alert.severity === severityFilter;
    return statusMatch && severityMatch;
  });

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'acknowledged' as const }
          : alert
      )
    );
  };

  const handleResolve = (alertId: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'resolved' as const }
          : alert
      )
    );
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'var_breach':
        return <AlertTriangle className="h-5 w-5" />;
      case 'concentration_risk':
        return <AlertTriangle className="h-5 w-5" />;
      case 'margin_call':
        return <Bell className="h-5 w-5" />;
      case 'suspicious_trade':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getStatusIcon = (status: Alert['status']) => {
    switch (status) {
      case 'active':
        return <Bell className="h-4 w-4 text-red-500" />;
      case 'acknowledged':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  // Count alerts by status
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts & Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage risk alerts across all portfolios
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.length}</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-red-600">{activeCount}</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Acknowledged</p>
                <p className="text-2xl font-bold text-amber-600">{acknowledgedCount}</p>
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${
            alert.severity === 'high' ? 'border-l-red-500' :
            alert.severity === 'medium' ? 'border-l-amber-500' : 'border-l-blue-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`${
                      alert.severity === 'high' ? 'text-red-500' :
                      alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {alert.title}
                    </h3>
                    <Badge variant={
                      alert.severity === 'high' ? 'danger' :
                      alert.severity === 'medium' ? 'warning' : 'info'
                    }>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <div className="flex items-center">
                      {getStatusIcon(alert.status)}
                      <span className="ml-1 text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {alert.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {alert.portfolio_name && (
                      <span>Portfolio: <strong>{alert.portfolio_name}</strong></span>
                    )}
                    <span>Time: {formatDateTime(alert.timestamp)}</span>
                    {alert.threshold_value && alert.current_value && (
                      <span>
                        Current: <strong>{alert.current_value}</strong> / 
                        Threshold: <strong>{alert.threshold_value}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {alert.status === 'active' && (
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAcknowledge(alert.id)}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                )}
                
                {alert.status === 'acknowledged' && (
                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Bell className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No alerts found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No alerts match your current filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}