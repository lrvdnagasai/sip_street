import api from './api';

export const billingService = {
  getBillingProducts: async (params = {}) => {
    const response = await api.get('/api/billing/products', { params });
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await api.post('/api/billing/invoice', invoiceData);
    return response.data;
  },

  getInvoice: async (id) => {
    const response = await api.get(`/api/billing/invoices/${id}`);
    return response.data;
  },

  getInvoiceHistory: async (limit = 50) => {
    const response = await api.get(`/api/billing/history?limit=${limit}`);
    return response.data;
  },
};

export default billingService;
