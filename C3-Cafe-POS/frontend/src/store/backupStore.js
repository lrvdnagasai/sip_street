import { create } from 'zustand';
import backupService from '../services/backupService';

export const useBackupStore = create((set, get) => ({
  summary: null,
  history: [],
  validationResults: {}, // { [backupName]: { is_valid: boolean, error_message: string } }
  isLoading: false,
  error: null,
  successMessage: null,

  isCreateModalOpen: false,
  isRestoreModalOpen: false,
  selectedBackupForRestore: null,

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  openRestoreModal: (backup) => set({ isRestoreModalOpen: true, selectedBackupForRestore: backup }),
  closeRestoreModal: () => set({ isRestoreModalOpen: false, selectedBackupForRestore: null }),

  fetchBackupData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [sumData, histData] = await Promise.all([
        backupService.getSummary(),
        backupService.getHistory(),
      ]);
      set({ summary: sumData, history: histData, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch backup data.';
      set({ error: msg, isLoading: false });
    }
  },

  createBackup: async (customName, format) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const newBackup = await backupService.createBackup({ custom_name: customName, backup_format: format });
      set({
        successMessage: `Backup '${newBackup.backup_name}' created successfully!`,
        isCreateModalOpen: false,
      });
      await get().fetchBackupData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to create backup.';
      set({ error: msg, isLoading: false });
    }
  },

  validateBackup: async (backupName) => {
    try {
      const result = await backupService.validateBackup(backupName);
      set((state) => ({
        validationResults: {
          ...state.validationResults,
          [backupName]: result,
        },
      }));
    } catch (err) {
      const msg = err.response?.data?.detail || 'Validation failed.';
      set((state) => ({
        validationResults: {
          ...state.validationResults,
          [backupName]: { filename: backupName, is_valid: false, error_message: msg },
        },
      }));
    }
  },

  restoreBackup: async () => {
    const { selectedBackupForRestore } = get();
    if (!selectedBackupForRestore) return;

    set({ isLoading: true, error: null, successMessage: null });
    try {
      const res = await backupService.restoreBackup(selectedBackupForRestore.backup_name);
      set({
        successMessage: res.message || 'Database restored successfully!',
        isRestoreModalOpen: false,
        selectedBackupForRestore: null,
      });
      await get().fetchBackupData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Database restore failed.';
      set({ error: msg, isLoading: false });
    }
  },

  uploadBackup: async (file) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const uploaded = await backupService.uploadBackup(file);
      set({
        successMessage: `Uploaded and validated '${uploaded.backup_name}' successfully!`,
      });
      await get().fetchBackupData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Backup upload failed.';
      set({ error: msg, isLoading: false });
    }
  },

  deleteBackup: async (backupName) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      await backupService.deleteBackup(backupName);
      set({
        successMessage: `Backup file '${backupName}' deleted from history.`,
      });
      await get().fetchBackupData();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to delete backup file.';
      set({ error: msg, isLoading: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));

export default useBackupStore;
