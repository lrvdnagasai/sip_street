import React from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function BusinessInfoSection() {
  const { formData, updateFormField } = useSettingsStore();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Cafe Name *
          </label>
          <input
            type="text"
            value={formData.cafe_name || ''}
            onChange={(e) => updateFormField('cafe_name', e.target.value)}
            maxLength={100}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Owner / Manager Name *
          </label>
          <input
            type="text"
            value={formData.owner_name || ''}
            onChange={(e) => updateFormField('owner_name', e.target.value)}
            maxLength={100}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Phone Number *
          </label>
          <input
            type="text"
            value={formData.phone_number || ''}
            onChange={(e) => updateFormField('phone_number', e.target.value)}
            maxLength={20}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateFormField('email', e.target.value)}
            maxLength={100}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            GST / Tax ID (Optional)
          </label>
          <input
            type="text"
            value={formData.gst_number || ''}
            onChange={(e) => updateFormField('gst_number', e.target.value)}
            placeholder="e.g. 29ABCDE1234F1Z5"
            maxLength={50}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Logo URL Path (Optional)
          </label>
          <input
            type="text"
            value={formData.logo_path || ''}
            onChange={(e) => updateFormField('logo_path', e.target.value)}
            placeholder="e.g. /assets/logo.png"
            maxLength={255}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Complete Business Address *
        </label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => updateFormField('address', e.target.value)}
          rows={2}
          maxLength={255}
          className="w-full p-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50 resize-none"
          required
        />
      </div>
    </div>
  );
}
