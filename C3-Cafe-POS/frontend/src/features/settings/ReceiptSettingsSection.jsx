import React from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function ReceiptSettingsSection() {
  const { formData, updateFormField } = useSettingsStore();

  return (
    <div className="space-y-4 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Thermal Printer Width
          </label>
          <div className="grid grid-cols-2 gap-3">
            {['58mm', '80mm'].map((width) => (
              <button
                type="button"
                key={width}
                onClick={() => updateFormField('receipt_width', width)}
                className={`p-3 rounded-xl border text-center font-bold text-xs transition ${
                  formData.receipt_width === width
                    ? 'border-coffee-brown bg-amber-50/60 text-coffee-brown shadow-xs'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <span>{width} Standard</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
            Currency Symbol
          </label>
          <input
            type="text"
            value={formData.currency_symbol || '₹'}
            onChange={(e) => updateFormField('currency_symbol', e.target.value)}
            maxLength={10}
            className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-mono font-bold text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
          Receipt Footer Message
        </label>
        <input
          type="text"
          value={formData.receipt_footer || ''}
          onChange={(e) => updateFormField('receipt_footer', e.target.value)}
          maxLength={255}
          placeholder="e.g. Thank You! Visit Again"
          className="w-full h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-1 focus:ring-coffee-brown bg-stone-50"
        />
      </div>

      <div className="flex items-center space-x-3 pt-2">
        <input
          type="checkbox"
          id="show_print_count"
          checked={formData.show_print_count || false}
          onChange={(e) => updateFormField('show_print_count', e.target.checked)}
          className="w-4 h-4 text-coffee-brown rounded border-stone-300 focus:ring-coffee-brown"
        />
        <label htmlFor="show_print_count" className="text-xs font-bold text-stone-800 cursor-pointer">
          Display 'Print Audit Counter' on Customer Receipts
        </label>
      </div>
    </div>
  );
}
