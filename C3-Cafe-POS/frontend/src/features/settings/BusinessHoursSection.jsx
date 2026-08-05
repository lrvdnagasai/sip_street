import React from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function BusinessHoursSection() {
  const { formData, updateFormField } = useSettingsStore();

  return (
    <div className="space-y-4 select-none">
      <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
        ℹ️ Dashboard hourly charts and operational reports automatically consume these operating hours.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Opening Time (HH:MM) *
          </label>
          <input
            type="time"
            value={formData.opening_time || '08:00'}
            onChange={(e) => updateFormField('opening_time', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono font-bold text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Closing Time (HH:MM) *
          </label>
          <input
            type="time"
            value={formData.closing_time || '22:00'}
            onChange={(e) => updateFormField('closing_time', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono font-bold text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>
      </div>
    </div>
  );
}
