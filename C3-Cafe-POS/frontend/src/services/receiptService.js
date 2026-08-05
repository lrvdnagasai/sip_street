import api from './api';

export const receiptService = {
  getReceipt: async (invoiceId) => {
    const response = await api.get(`/api/receipts/${invoiceId}`);
    return response.data;
  },

  getReceiptByNumber: async (invoiceNumber) => {
    const response = await api.get(`/api/receipts/by-number/${invoiceNumber}`);
    return response.data;
  },

  recordPrint: async (invoiceId) => {
    const response = await api.patch(`/api/receipts/${invoiceId}/printed`);
    return response.data;
  },
};

export default receiptService;
