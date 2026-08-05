import React, { useState } from 'react';
import useBackupStore from '../../store/backupStore';

export default function CreateBackupModal() {
  const { isCreateModalOpen, isLoading, closeCreateModal, createBackup } = useBackupStore();

  const [customName, setCustomName] = useState('');
  const [format, setFormat] = useState('ZIP');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createBackup(customName, format);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-coffee-brown">Create System Backup</h3>
            <p className="text-xs text-stone-500">Archive full POS database & system records</p>
          </div>
          <button
            onClick={closeCreateModal}
            className="text-stone-400 hover:text-stone-600 font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Custom Name Label (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Closing_Backup_Day1"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={60}
              className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            />
            <p className="text-[11px] text-stone-400 mt-1">If left blank, timestamp will be generated automatically.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Backup Archive Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat('ZIP')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  format === 'ZIP'
                    ? 'border-coffee-brown bg-amber-50/60 text-coffee-brown font-bold shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Compressed ZIP</span>
                  <span className="text-base">📦</span>
                </div>
                <span className="text-[10px] text-stone-500 font-normal mt-1">Recommended (.zip)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('DB')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  format === 'DB'
                    ? 'border-coffee-brown bg-amber-50/60 text-coffee-brown font-bold shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs">Raw Database</span>
                  <span className="text-base">🗄️</span>
                </div>
                <span className="text-[10px] text-stone-500 font-normal mt-1">Direct SQLite (.db)</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={isLoading}
              className="h-10 px-4 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-xs transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <span>{isLoading ? 'Creating...' : 'Generate Backup'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
