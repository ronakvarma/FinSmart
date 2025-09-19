import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Auth Components
import { LoginForm } from './components/auth/LoginForm';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Portfolios } from './pages/Portfolios';
import { PortfolioDetails } from './pages/PortfolioDetails';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { Alerts } from './pages/Alerts';
import { SuspiciousTrades } from './pages/SuspiciousTrades';
import { Settings } from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/portfolios"
          element={
            <ProtectedRoute>
              <Portfolios />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/portfolios/:id"
          element={
            <ProtectedRoute>
              <PortfolioDetails />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/risk-analysis"
          element={
            <ProtectedRoute>
              <RiskAnalysis />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/suspicious-trades"
          element={
            <ProtectedRoute>
              <SuspiciousTrades />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;