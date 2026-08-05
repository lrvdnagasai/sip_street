import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getRootStatus = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getHealthStatus = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
