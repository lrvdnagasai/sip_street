import { create } from 'zustand';
import settingsService from '../services/settingsService';

export const useSettingsStore = create((set, get) => ({
  settings: null,
  formData: {},
  isDirty: false,
  isLoading: false,
  isSaving: false,
  error: null,
  successMessage: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await settingsService.getSettings();
      set({
        settings: data,
        formData: { ...data },
        isDirty: false,
        isLoading: false,
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch application settings.';
      set({ error: msg, isLoading: false });
    }
  },

  updateFormField: (key, value) => {
    set((state) => {
      const newFormData = { ...state.formData, [key]: value };
      const isDirty = JSON.stringify(newFormData) !== JSON.stringify(state.settings);
      return { formData: newFormData, isDirty, error: null, successMessage: null };
    });
  },

  saveSettings: async () => {
    const { formData } = get();
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const updated = await settingsService.updateSettings(formData);
      set({
        settings: updated,
        formData: { ...updated },
        isDirty: false,
        isSaving: false,
        successMessage: 'Settings updated successfully!',
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save settings.';
      set({ error: msg, isSaving: false });
    }
  },

  resetToDefaults: async () => {
    set({ isSaving: true, error: null, successMessage: null });
    try {
      const reset = await settingsService.resetSettings();
      set({
        settings: reset,
        formData: { ...reset },
        isDirty: false,
        isSaving: false,
        successMessage: 'Settings restored to factory defaults.',
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset settings.';
      set({ error: msg, isSaving: false });
    }
  },

  clearMessages: () => set({ error: null, successMessage: null }),
}));

export default useSettingsStore;
