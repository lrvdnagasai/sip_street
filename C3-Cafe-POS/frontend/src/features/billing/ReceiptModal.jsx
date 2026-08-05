import React from 'react';

export default function ReceiptModal({ invoice, onClose }) {
  if (!invoice) return null;

  const formattedDate = new Date(invoice.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Bar (Screen only) */}
        <div className="bg-coffee-brown text-white px-6 py-4 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🧾</span>
            <h2 className="text-base font-bold tracking-wide">Receipt Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200/80 hover:text-white font-bold text-xl leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-stone-900 bg-amber-50/20 space-y-4 print:p-0 print:bg-white">
          {/* Cafe Header */}
          <div className="text-center space-y-1 border-b border-dashed border-stone-400 pb-3">
            <h1 className="text-lg font-bold font-sans tracking-tight text-coffee-brown">C³ CAFE POS</h1>
            <p className="text-[11px] text-stone-600">Taste the Freshness</p>
            <div className="text-[10px] text-stone-500 pt-1">
              <span>Invoice #: </span>
              <span className="font-bold text-stone-900">{invoice.invoice_number}</span>
            </div>
            <div className="text-[10px] text-stone-500">
              <span>Date: </span>
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Customer & Cashier Metadata */}
          <div className="flex justify-between text-[11px] border-b border-dashed border-stone-300 pb-2">
            <div>
              <span className="text-stone-500">Cashier: </span>
              <span className="font-semibold">{invoice.cashier_name || `User #${invoice.cashier_id}`}</span>
            </div>
            <div>
              <span className="text-stone-500">Customer: </span>
              <span className="font-semibold">{invoice.customer_name || 'Walk-in'}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5 border-b border-dashed border-stone-400 pb-3">
            <div className="flex justify-between font-bold text-[11px] text-stone-700 uppercase tracking-wider pb-1">
              <span className="w-1/2">Item</span>
              <span className="w-12 text-center">Qty</span>
              <span className="w-16 text-right">Price</span>
              <span className="w-16 text-right">Total</span>
            </div>

            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-[11px]">
                <span className="w-1/2 font-sans font-medium text-stone-900 truncate pr-1">
                  {item.product_name}
                </span>
                <span className="w-12 text-center font-bold">{item.quantity}</span>
                <span className="w-16 text-right text-stone-600">₹{parseFloat(item.unit_price).toFixed(2)}</span>
                <span className="w-16 text-right font-bold text-stone-900">₹{parseFloat(item.line_total).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals & Payment Summary */}
          <div className="space-y-1.5 text-xs pt-1 border-b border-dashed border-stone-400 pb-3">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>₹{parseFloat(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-coffee-brown pt-1">
              <span>Grand Total</span>
              <span>₹{parseFloat(invoice.grand_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-600 pt-1">
              <span>Payment Mode ({invoice.payment_mode})</span>
              <span>₹{parseFloat(invoice.amount_received).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-stone-800 font-semibold">
              <span>Change / Balance</span>
              <span>₹{parseFloat(invoice.balance_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center text-[10px] text-stone-500 pt-1">
            <p>Thank you for visiting C³ Cafe!</p>
            <p>Have a wonderful day!</p>
          </div>
        </div>

        {/* Action Buttons (Screen only) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end space-x-3 shrink-0 print:hidden">
          <button
            onClick={handlePrint}
            className="h-11 px-5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
          >
            <span>🖨️</span>
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="h-11 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-xs shadow transition flex items-center space-x-1"
          >
            <span>+</span>
            <span>New Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
