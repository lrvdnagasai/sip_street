import React from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function AppSettingsSection() {
  const { formData, updateFormField } = useSettingsStore();

  return (
    <div className="space-y-4 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Application Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Light', 'Dark', 'System'].map((theme) => (
              <button
                type="button"
                key={theme}
                onClick={() => updateFormField('app_theme', theme)}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  formData.app_theme === theme
                    ? 'border-coffee-brown bg-amber-50/60 text-coffee-brown shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Date Format
          </label>
          <select
            value={formData.date_format || 'DD/MM/YYYY'}
            onChange={(e) => updateFormField('date_format', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 05/08/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/05/2026)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-05)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Time Format
          </label>
          <select
            value={formData.time_format || '12 Hour'}
            onChange={(e) => updateFormField('time_format', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          >
            <option value="12 Hour">12 Hour (AM/PM e.g. 02:30 PM)</option>
            <option value="24 Hour">24 Hour (e.g. 14:30)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Timezone
          </label>
          <input
            type="text"
            value={formData.timezone || 'Asia/Kolkata'}
            onChange={(e) => updateFormField('timezone', e.target.value)}
            maxLength={50}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          />
        </div>
      </div>
    </div>
  );
}
