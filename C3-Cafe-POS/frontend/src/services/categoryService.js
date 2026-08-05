import api from './api';

export const categoryService = {
  getCategories: async (includeInactive = false) => {
    const response = await api.get(`/api/categories?include_inactive=${includeInactive}`);
    return response.data;
  },

  getCategory: async (id) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },

  disableCategory: async (id) => {
    const response = await api.patch(`/api/categories/${id}/disable`);
    return response.data;
  },

  enableCategory: async (id) => {
    const response = await api.patch(`/api/categories/${id}/enable`);
    return response.data;
  },
};

export default categoryService;
