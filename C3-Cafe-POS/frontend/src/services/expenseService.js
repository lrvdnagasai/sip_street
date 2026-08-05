import api from './api';

export const expenseService = {
  getExpenses: async (params = {}) => {
    const response = await api.get('/api/expenses', { params });
    return response.data;
  },

  getExpenseSummary: async () => {
    const response = await api.get('/api/expenses/summary');
    return response.data;
  },

  getExpense: async (id) => {
    const response = await api.get(`/api/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data) => {
    const response = await api.post('/api/expenses', data);
    return response.data;
  },

  updateExpense: async (id, data) => {
    const response = await api.put(`/api/expenses/${id}`, data);
    return response.data;
  },

  disableExpense: async (id) => {
    const response = await api.patch(`/api/expenses/${id}/disable`);
    return response.data;
  },

  enableExpense: async (id) => {
    const response = await api.patch(`/api/expenses/${id}/enable`);
    return response.data;
  },
};

export default expenseService;
