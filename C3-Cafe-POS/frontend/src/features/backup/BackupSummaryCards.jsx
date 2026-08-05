import React from 'react';

export default function BackupSummaryCards({ summary }) {
  const latestDate = summary?.latest_backup_date
    ? new Date(summary.latest_backup_date).toLocaleString()
    : 'Never';
  const totalBackups = summary?.total_backups || 0;
  const storageUsed = summary?.total_storage_human || '0 B';
  const liveDbSize = summary?.live_db_size_human || '0 B';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
      <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Latest Backup</span>
          <div className="text-sm font-bold font-mono text-emerald-900 mt-1 truncate max-w-[180px]">
            {latestDate}
          </div>
        </div>
        <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">🛡️</span>
      </div>

      <div className="p-4 rounded-2xl border bg-coffee-brown/10 border-amber-900/20 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Backups</span>
          <div className="text-2xl font-bold font-mono text-coffee-brown mt-1">{totalBackups}</div>
        </div>
        <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📦</span>
      </div>

      <div className="p-4 rounded-2xl border bg-indigo-500/10 border-indigo-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Storage Used</span>
          <div className="text-2xl font-bold font-mono text-indigo-900 mt-1">{storageUsed}</div>
        </div>
        <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💾</span>
      </div>

      <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-200 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Live DB Size</span>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-1">{liveDbSize}</div>
        </div>
        <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">🗄️</span>
      </div>
    </div>
  );
}
