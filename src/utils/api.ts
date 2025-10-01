/**
 * API Client for FinSmart Backend
 * Centralized API communication with the backend server
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async verifyAuth() {
    return this.request('/auth/verify');
  }

  // Portfolio endpoints
  async getPortfolios(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/portfolios${queryString}`);
  }

  async getPortfolio(id: string) {
    return this.request(`/portfolios/${id}`);
  }

  async createPortfolio(data: any) {
    return this.request('/portfolios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePortfolio(id: string, data: any) {
    return this.request(`/portfolios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePortfolio(id: string) {
    return this.request(`/portfolios/${id}`, {
      method: 'DELETE',
    });
  }

  async getPortfolioHoldings(id: string) {
    return this.request(`/portfolios/${id}/holdings`);
  }

  // Alert endpoints
  async getAlerts(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/alerts${queryString}`);
  }

  async getAlert(id: string) {
    return this.request(`/alerts/${id}`);
  }

  async createAlert(data: any) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: string, data: any) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async acknowledgeAlert(id: string) {
    return this.request(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
    });
  }

  async resolveAlert(id: string) {
    return this.request(`/alerts/${id}/resolve`, {
      method: 'PATCH',
    });
  }

  // Suspicious trades endpoints
  async getSuspiciousTrades(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/trades/suspicious${queryString}`);
  }

  async getSuspiciousTrade(id: string) {
    return this.request(`/trades/suspicious/${id}`);
  }

  async reportSuspiciousTrade(data: any) {
    return this.request('/trades/suspicious', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSuspiciousTrade(id: string, data: any) {
    return this.request(`/trades/suspicious/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignSuspiciousTrade(id: string, assignedTo: string) {
    return this.request(`/trades/suspicious/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
  }

  async getSuspiciousTradeStats() {
    return this.request('/trades/suspicious/stats');
  }

  // Risk analysis endpoints
  async getRiskMetrics(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/risk/metrics${queryString}`);
  }

  async getConcentrationAnalysis(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/risk/concentration${queryString}`);
  }

  async getVarAnalysis(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/risk/var-analysis${queryString}`);
  }

  async performStressTest(data: any) {
    return this.request('/risk/stress-test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRiskDashboard() {
    return this.request('/risk/dashboard');
  }

  // User management endpoints (admin only)
  async getUsers(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${queryString}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request('/users/stats');
  }

  async getUserActivity(id: string, params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users/${id}/activity${queryString}`);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types
export type { ApiResponse };