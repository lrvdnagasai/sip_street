import api from './api';

export const dashboardService = {
  getSummary: async (params = {}) => {
    const response = await api.get('/api/dashboard/summary', { params });
    return response.data;
  },

  getPaymentSummary: async (params = {}) => {
    const response = await api.get('/api/dashboard/payment-summary', { params });
    return response.data;
  },

  getTopProducts: async (params = {}) => {
    const response = await api.get('/api/dashboard/top-products', { params });
    return response.data;
  },

  getHourlySales: async (params = {}) => {
    const response = await api.get('/api/dashboard/hourly-sales', { params });
    return response.data;
  },

  getRecentTransactions: async (limit = 10) => {
    const response = await api.get(`/api/dashboard/recent-transactions?limit=${limit}`);
    return response.data;
  },
};

export default dashboardService;
