import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSettingsStore from '../store/settingsStore';

import BusinessInfoSection from '../features/settings/BusinessInfoSection';
import ReceiptSettingsSection from '../features/settings/ReceiptSettingsSection';
import BackupSettingsSection from '../features/settings/BackupSettingsSection';
import AppSettingsSection from '../features/settings/AppSettingsSection';
import BusinessHoursSection from '../features/settings/BusinessHoursSection';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const {
    isDirty,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchSettings,
    saveSettings,
    resetToDefaults,
    clearMessages,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState('BUSINESS');

  // CASHIER Role restriction: Redirect cashiers to Billing page
  if (user && user.role === 'CASHIER') {
    return <Navigate to="/billing" replace />;
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const tabs = [
    { key: 'BUSINESS', label: 'Business Information', icon: '🏪' },
    { key: 'RECEIPT', label: 'Receipt Configuration', icon: '🧾' },
    { key: 'HOURS', label: 'Operating Hours', icon: '⏰' },
    { key: 'BACKUP', label: 'Backup Defaults', icon: '🛡️' },
    { key: 'APP', label: 'App Preferences', icon: '⚙️' },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all application settings to factory defaults?')) {
      resetToDefaults();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-coffee-brown">Application & Business Settings</h1>
            {isDirty && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600">Centralized database-driven business, receipt, and system parameters</p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={handleReset}
            disabled={isSaving || isLoading}
            className="h-10 px-4 rounded-xl border border-stone-300 bg-white hover:bg-rose-50 hover:text-rose-800 text-stone-700 font-bold text-xs shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>Reset to Defaults</span>
          </button>

          <button
            onClick={saveSettings}
            disabled={!isDirty || isSaving || isLoading}
            className="h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center space-x-2"
          >
            <span>💾</span>
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banners */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center select-none">
          <span>{error}</span>
          <button onClick={clearMessages} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 flex justify-between items-center select-none">
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="font-bold text-emerald-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="bg-stone-200/70 p-1.5 rounded-2xl flex flex-wrap gap-1 select-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-white text-coffee-brown shadow-sm'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 text-xs font-semibold animate-pulse">
            Loading settings configuration...
          </div>
        ) : (
          <>
            {activeTab === 'BUSINESS' && <BusinessInfoSection />}
            {activeTab === 'RECEIPT' && <ReceiptSettingsSection />}
            {activeTab === 'HOURS' && <BusinessHoursSection />}
            {activeTab === 'BACKUP' && <BackupSettingsSection />}
            {activeTab === 'APP' && <AppSettingsSection />}
          </>
        )}
      </div>
    </div>
  );
}
