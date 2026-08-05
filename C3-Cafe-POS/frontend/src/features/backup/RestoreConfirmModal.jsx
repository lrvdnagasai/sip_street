import React from 'react';
import useBackupStore from '../../store/backupStore';

export default function RestoreConfirmModal() {
  const {
    isRestoreModalOpen,
    selectedBackupForRestore,
    isLoading,
    closeRestoreModal,
    restoreBackup,
  } = useBackupStore();

  if (!isRestoreModalOpen || !selectedBackupForRestore) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-xl border border-rose-200 w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-rose-900">
            <span className="text-xl">⚠️</span>
            <h3 className="text-base font-bold">Confirm System Database Restore</h3>
          </div>
          <button
            onClick={closeRestoreModal}
            className="text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <div className="bg-rose-100/60 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-900 leading-relaxed font-medium">
            <p className="font-bold uppercase tracking-wider mb-1">Critical Warning:</p>
            Restoring this backup will replace all active database data (sales, billing invoices, products, and categories) with records from the backup file.
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Target Backup:</span>
              <span className="font-bold text-stone-900 truncate max-w-[200px]">{selectedBackupForRestore.backup_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Created Date:</span>
              <span className="text-stone-700">{new Date(selectedBackupForRestore.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 font-sans">Archive Size:</span>
              <span className="text-stone-700">{selectedBackupForRestore.file_size_human}</span>
            </div>
          </div>

          <p className="text-xs text-stone-500">
            A safety pre-restore backup of your current live database will be created automatically prior to restoration.
          </p>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={closeRestoreModal}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={restoreBackup}
              disabled={isLoading}
              className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{isLoading ? 'Restoring Database...' : 'Yes, Restore Database'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
