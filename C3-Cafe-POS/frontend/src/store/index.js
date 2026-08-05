import { create } from 'zustand';

export const useAppStore = create((set) => ({
  appName: 'C³ Cafe POS',
  version: '1.0.0',
  isBackendConnected: false,
  setBackendConnected: (status) => set({ isBackendConnected: status }),
}));
