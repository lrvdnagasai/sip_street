import React, { useState, useEffect } from 'react';
import Receipt from './Receipt';
import receiptService from '../../services/receiptService';

export default function ReceiptPreviewModal({ invoice, isOpen = true, onClose, onAuditUpdate = null }) {
  const [paperSize, setPaperSize] = useState('80mm');
  const [currentInvoice, setCurrentInvoice] = useState(invoice);

  useEffect(() => {
    setCurrentInvoice(invoice);
  }, [invoice]);

  if (!isOpen || !currentInvoice) return null;

  const handlePrint = async () => {
    window.print();
    try {
      const audit = await receiptService.recordPrint(currentInvoice.id);
      const updated = {
        ...currentInvoice,
        print_count: audit.print_count,
        last_printed_at: audit.last_printed_at,
      };
      setCurrentInvoice(updated);
      if (onAuditUpdate) {
        onAuditUpdate(updated);
      }
    } catch (err) {
      console.error('Failed to record print audit:', err);
    }
  };

  const handleReprint = async () => {
    await handlePrint();
  };

  const formattedLastPrinted = currentInvoice.last_printed_at
    ? new Date(currentInvoice.last_printed_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Never';

  const printCountText =
    currentInvoice.print_count === 1
      ? '1 Time'
      : `${currentInvoice.print_count || 0} Times`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn print:p-0 print:static print:bg-transparent">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] print:shadow-none print:border-none print:w-full print:max-w-none">
        {/* Modal Header Controls (Screen only) */}
        <div className="bg-coffee-brown text-white px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h2 className="text-base font-bold tracking-wide">Thermal Receipt Preview</h2>
              <p className="text-[11px] text-amber-200/80 font-mono">Invoice #{currentInvoice.invoice_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-200/80 hover:text-white font-bold text-xl leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* Paper Size & Audit Bar (Screen only) */}
        <div className="bg-stone-100 p-3 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 print:hidden text-xs">
          <div className="flex items-center space-x-3 text-stone-600 font-mono text-[11px]">
            <div>
              <span className="text-stone-400">Printed: </span>
              <span className="font-bold text-stone-900">{printCountText}</span>
            </div>
            <div>
              <span className="text-stone-400">Last: </span>
              <span className="font-semibold text-stone-800">{formattedLastPrinted}</span>
            </div>
          </div>

          <div className="flex space-x-1.5 self-end sm:self-auto">
            <button
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                paperSize === '80mm'
                  ? 'bg-coffee-brown text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
            >
              80 mm
            </button>
            <button
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                paperSize === '58mm'
                  ? 'bg-coffee-brown text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
            >
              58 mm
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50 print:p-0 print:bg-white print:overflow-visible">
          <Receipt invoice={currentInvoice} paperSize={paperSize} />
        </div>

        {/* Action Buttons (Screen only) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end space-x-3 shrink-0 print:hidden">
          {(currentInvoice.print_count || 0) > 0 && (
            <button
              onClick={handleReprint}
              className="h-11 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-coffee-brown font-bold text-xs transition flex items-center space-x-1.5"
            >
              <span>🔄</span>
              <span>Reprint ({currentInvoice.print_count})</span>
            </button>
          )}
          <button
            onClick={handlePrint}
            className="h-11 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-xs shadow transition flex items-center space-x-1.5"
          >
            <span>🖨️</span>
            <span>{(currentInvoice.print_count || 0) > 0 ? 'Print Again' : 'Print Receipt'}</span>
          </button>
          <button
            onClick={onClose}
            className="h-11 px-5 rounded-xl border border-stone-300 bg-white hover:bg-stone-200 text-stone-700 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
