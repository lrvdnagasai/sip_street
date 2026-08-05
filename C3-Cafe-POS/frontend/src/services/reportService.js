import api from './api';

export const reportService = {
  getSalesReport: async (params = {}) => {
    const response = await api.get('/api/reports/sales', { params });
    return response.data;
  },

  getExpenseReport: async (params = {}) => {
    const response = await api.get('/api/reports/expenses', { params });
    return response.data;
  },

  getProfitReport: async (params = {}) => {
    const response = await api.get('/api/reports/profit', { params });
    return response.data;
  },

  getProductReport: async (params = {}) => {
    const response = await api.get('/api/reports/products', { params });
    return response.data;
  },

  getCategoryReport: async (params = {}) => {
    const response = await api.get('/api/reports/categories', { params });
    return response.data;
  },

  getCashierReport: async (params = {}) => {
    const response = await api.get('/api/reports/cashiers', { params });
    return response.data;
  },

  getPaymentReport: async (params = {}) => {
    const response = await api.get('/api/reports/payments', { params });
    return response.data;
  },
};

export default reportService;
