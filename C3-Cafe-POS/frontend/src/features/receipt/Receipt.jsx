import React, { useEffect } from 'react';
import useSettingsStore from '../../store/settingsStore';

export default function Receipt({
  invoice,
  paperSize,
}) {
  const { settings, fetchSettings } = useSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, []);

  if (!invoice) return null;

  const cafeName = settings?.cafe_name || 'C³ CAFE POS';
  const cafeAddress = settings?.address || '123 Coffee Street, Tech Hub, Bengaluru';
  const cafePhone = settings?.phone_number || '+91 98765 43210';
  const gstNumber = settings?.gst_number;
  const currency = settings?.currency_symbol || '₹';
  const footerMsg = settings?.receipt_footer || 'Thank You! Visit Again';
  const showPrintCount = settings?.show_print_count || false;

  const activePaperSize = paperSize || settings?.receipt_width || '80mm';
  const is58mm = activePaperSize === '58mm';

  const formattedDate = new Date(invoice.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div
      className={`mx-auto bg-white font-mono text-stone-900 leading-tight p-4 shadow-sm border border-stone-200 transition-all ${
        is58mm ? 'w-[58mm] text-[10px]' : 'w-[80mm] text-xs'
      }`}
      id="printable-thermal-receipt"
    >
      {/* Receipt Header */}
      <div className="text-center space-y-1 border-b border-dashed border-stone-400 pb-3">
        <h1 className="font-bold font-sans tracking-tight text-coffee-brown text-base">
          {cafeName}
        </h1>
        <p className="text-[10px] text-stone-500">{cafeAddress}</p>
        <p className="text-[10px] text-stone-500">Ph: {cafePhone}</p>
        {gstNumber && <p className="text-[10px] text-stone-500">GSTIN: {gstNumber}</p>}
        <div className="pt-1 font-bold text-stone-900 text-xs">
          Invoice #: {invoice.invoice_number}
        </div>
        <div className="text-[10px] text-stone-500">{formattedDate}</div>
      </div>

      {/* Metadata */}
      <div className="flex justify-between text-[11px] py-2 border-b border-dashed border-stone-300">
        <div>
          <span className="text-stone-500">Cashier: </span>
          <span className="font-bold">{invoice.cashier_name || `User #${invoice.cashier_id}`}</span>
        </div>
        <div>
          <span className="text-stone-500">Customer: </span>
          <span className="font-bold">{invoice.customer_name || 'Walk-in'}</span>
        </div>
      </div>

      {/* Line Items */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-1">
        <div className="flex justify-between font-bold text-stone-800 uppercase tracking-wider pb-1 border-b border-stone-200">
          <span className="w-1/2">Item</span>
          <span className="w-8 text-center">Qty</span>
          <span className="w-14 text-right">Price</span>
          <span className="w-14 text-right">Total</span>
        </div>

        {invoice.items &&
          invoice.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-0.5">
              <span className="w-1/2 font-sans font-semibold text-stone-900 truncate pr-1">
                {item.product_name}
              </span>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <span className="w-14 text-right text-stone-600">
                {currency}{parseFloat(item.unit_price).toFixed(2)}
              </span>
              <span className="w-14 text-right font-bold text-stone-900">
                {currency}{parseFloat(item.line_total).toFixed(2)}
              </span>
            </div>
          ))}
      </div>

      {/* Totals Section */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-1">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{currency}{parseFloat(invoice.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm text-coffee-brown pt-1">
          <span>Grand Total</span>
          <span>{currency}{parseFloat(invoice.grand_total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-stone-600 pt-1">
          <span>Payment ({invoice.payment_mode})</span>
          <span>{currency}{parseFloat(invoice.amount_received).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-stone-900 font-bold">
          <span>Change / Balance</span>
          <span>{currency}{parseFloat(invoice.balance_amount).toFixed(2)}</span>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center text-[10px] text-stone-500 pt-3 space-y-0.5">
        <p className="font-bold text-stone-700">{footerMsg}</p>
        {showPrintCount && (
          <p className="text-[9px] text-stone-400 font-mono pt-1">
            Print Counter: {invoice.print_count || 1}
          </p>
        )}
      </div>
    </div>
  );
}
