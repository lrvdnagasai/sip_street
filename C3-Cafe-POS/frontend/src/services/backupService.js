import api from './api';

export const backupService = {
  getSummary: async () => {
    const response = await api.get('/api/backup/summary');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/api/backup/history');
    return response.data;
  },

  createBackup: async (data = {}) => {
    const response = await api.post('/api/backup/create', data);
    return response.data;
  },

  validateBackup: async (backupName) => {
    const response = await api.post(`/api/backup/validate?backup_name=${encodeURIComponent(backupName)}`);
    return response.data;
  },

  restoreBackup: async (backupName) => {
    const response = await api.post('/api/backup/restore', {
      backup_name: backupName,
      confirm: true,
    });
    return response.data;
  },

  uploadBackup: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/backup/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  downloadBackup: async (backupName) => {
    const response = await api.get(`/api/backup/download/${encodeURIComponent(backupName)}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', backupName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteBackup: async (backupName) => {
    const response = await api.delete(`/api/backup/${encodeURIComponent(backupName)}`);
    return response.data;
  },
};

export default backupService;
