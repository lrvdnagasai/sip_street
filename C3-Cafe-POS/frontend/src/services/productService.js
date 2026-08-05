import api from './api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  toggleAvailability: async (id, isAvailable = null) => {
    const url = isAvailable !== null
      ? `/api/products/${id}/availability?is_available=${isAvailable}`
      : `/api/products/${id}/availability`;
    const response = await api.patch(url);
    return response.data;
  },

  disableProduct: async (id) => {
    const response = await api.patch(`/api/products/${id}/disable`);
    return response.data;
  },

  enableProduct: async (id) => {
    const response = await api.patch(`/api/products/${id}/enable`);
    return response.data;
  },
};

export default productService;
