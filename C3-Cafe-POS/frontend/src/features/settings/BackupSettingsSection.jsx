import React from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function BackupSettingsSection() {
  const { formData, updateFormField } = useSettingsStore();

  return (
    <div className="space-y-4 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Default Backup Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['ZIP', 'DB'].map((fmt) => (
              <button
                type="button"
                key={fmt}
                onClick={() => updateFormField('default_backup_format', fmt)}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  formData.default_backup_format === fmt
                    ? 'border-coffee-brown bg-amber-50/60 text-coffee-brown shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{fmt === 'ZIP' ? 'Compressed ZIP (.zip)' : 'Raw Database (.db)'}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Max Backup Retention Count
          </label>
          <input
            type="number"
            value={formData.max_backup_count || 30}
            onChange={(e) => updateFormField('max_backup_count', parseInt(e.target.value) || 30)}
            min={1}
            max={100}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono font-bold text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Default Backup Target Path
        </label>
        <input
          type="text"
          value={formData.default_backup_location || 'database/backups'}
          onChange={(e) => updateFormField('default_backup_location', e.target.value)}
          maxLength={255}
          className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
        />
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <input
          type="checkbox"
          id="auto_backup_on_exit"
          checked={formData.auto_backup_on_exit || false}
          onChange={(e) => updateFormField('auto_backup_on_exit', e.target.checked)}
          className="w-4 h-4 text-coffee-brown rounded border-stone-300 focus:ring-coffee-brown"
        />
        <label htmlFor="auto_backup_on_exit" className="text-xs font-bold text-stone-800 cursor-pointer">
          Trigger Auto-Backup on System Exit
        </label>
      </div>
    </div>
  );
}
