import React from 'react';
import useBackupStore from '../../store/backupStore';
import backupService from '../../services/backupService';

export default function BackupHistoryTable() {
  const {
    history,
    validationResults,
    isLoading,
    validateBackup,
    openRestoreModal,
    deleteBackup,
  } = useBackupStore();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden select-none">
      <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-coffee-brown uppercase tracking-wider flex items-center justify-between">
        <span>Backup History & Archives</span>
        <span className="text-stone-400 font-normal normal-case text-[11px]">{history.length} records</span>
      </div>

      <div className="overflow-x-auto">
        {history.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs font-semibold">
            No backup archives found. Click "Create Backup" above to generate a system backup.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Backup Name</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Created By</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4 text-right">Size</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {history.map((backup) => {
                const valResult = validationResults[backup.backup_name];
                return (
                  <tr key={backup.backup_name} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-cafe-dark">
                      <div className="flex items-center space-x-1.5">
                        <span>{backup.format === 'ZIP' ? '📦' : '🗄️'}</span>
                        <span className="truncate max-w-[220px]" title={backup.backup_name}>
                          {backup.backup_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {new Date(backup.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-stone-700">{backup.created_by}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-stone-100 text-stone-700 uppercase">
                        {backup.format}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-coffee-brown">
                      {backup.file_size_human}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {valResult ? (
                        valResult.is_valid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Valid ✓
                          </span>
                        ) : (
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 cursor-help"
                            title={valResult.error_message || 'Corrupted archive'}
                          >
                            Invalid ✗
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => validateBackup(backup.backup_name)}
                          className="text-[11px] text-stone-500 hover:text-coffee-brown underline font-bold"
                        >
                          Check
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {/* Download */}
                        <button
                          onClick={() => backupService.downloadBackup(backup.backup_name)}
                          className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold transition text-xs"
                          title="Download Backup File"
                        >
                          📥
                        </button>

                        {/* Restore */}
                        <button
                          onClick={() => openRestoreModal(backup)}
                          className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold transition text-xs"
                        >
                          Restore
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete backup file '${backup.backup_name}'?`)) {
                              deleteBackup(backup.backup_name);
                            }
                          }}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold transition text-xs"
                          title="Delete File"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
