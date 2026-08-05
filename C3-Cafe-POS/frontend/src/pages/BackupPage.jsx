import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useBackupStore from '../store/backupStore';

import BackupSummaryCards from '../features/backup/BackupSummaryCards';
import BackupHistoryTable from '../features/backup/BackupHistoryTable';
import CreateBackupModal from '../features/backup/CreateBackupModal';
import RestoreConfirmModal from '../features/backup/RestoreConfirmModal';

export default function BackupPage() {
  const { user } = useAuthStore();
  const {
    summary,
    isLoading,
    error,
    successMessage,
    fetchBackupData,
    openCreateModal,
    uploadBackup,
    clearMessages,
  } = useBackupStore();

  const fileInputRef = useRef(null);

  // CASHIER Role restriction: Redirect cashiers to Billing page
  if (user && user.role === 'CASHIER') {
    return <Navigate to="/billing" replace />;
  }

  useEffect(() => {
    fetchBackupData();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadBackup(file);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Data Backup & System Restoration</h1>
          <p className="text-xs text-stone-600">Offline SQLite database backups, checksum integrity checks, and safety restores</p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".zip,.db"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-10 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <span>📥</span>
            <span>Upload Backup File</span>
          </button>

          <button
            onClick={openCreateModal}
            className="h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2"
          >
            <span>🛡️</span>
            <span>Create Backup</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={clearMessages} className="font-bold text-emerald-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <BackupSummaryCards summary={summary} />

      {/* Backup History Table */}
      <BackupHistoryTable />

      {/* Modals */}
      <CreateBackupModal />
      <RestoreConfirmModal />
    </div>
  );
}
