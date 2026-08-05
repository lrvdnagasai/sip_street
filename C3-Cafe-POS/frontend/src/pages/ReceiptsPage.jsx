import React, { useEffect, useState, useMemo } from 'react';
import billingService from '../services/billingService';
import ReceiptPreviewModal from '../features/receipt/ReceiptPreviewModal';

export default function ReceiptsPage() {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const history = await billingService.getInvoiceHistory(100);
      setInvoices(history);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load receipt history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return invoices;
    const query = searchQuery.trim().toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.invoice_number.toLowerCase().includes(query) ||
        (inv.customer_name && inv.customer_name.toLowerCase().includes(query)) ||
        (inv.cashier_name && inv.cashier_name.toLowerCase().includes(query))
    );
  }, [invoices, searchQuery]);

  const handleOpenReceipt = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleAuditUpdate = (updatedInvoice) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
    );
    setSelectedInvoice(updatedInvoice);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Receipt History & Audit</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            View completed transaction invoices, audit print history, and reprint receipts.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          className="h-11 px-5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 font-bold text-xs shadow-xs transition flex items-center space-x-1.5 shrink-0"
        >
          <span>🔄</span>
          <span>Refresh History</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200">
        <div className="relative max-w-md">
          <input
            type="text"
            data-shortcut="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Invoice # (e.g. INV000001), Customer, or Cashier... (Ctrl+F)"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          />
          <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-base">🔍</span>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading && invoices.length === 0 ? (
          <div className="p-12 text-center text-stone-500 font-medium">
            <div className="w-6 h-6 border-2 border-coffee-brown border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading receipt history...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center max-w-md mx-auto space-y-3">
            <span className="text-4xl">🧾</span>
            <h2 className="text-xl font-bold text-cafe-dark">No Receipts Found</h2>
            <p className="text-sm text-stone-600">
              {searchQuery ? `No invoices matching "${searchQuery}".` : 'No invoices have been billed yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-coffee-brown text-white text-xs font-bold uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5">Invoice #</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Customer</th>
                  <th className="py-3.5 px-5">Cashier</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Print Count</th>
                  <th className="py-3.5 px-5">Last Printed</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y border-stone-200 text-sm font-medium">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-4 px-5 font-mono font-bold text-coffee-brown">
                      {inv.invoice_number}
                    </td>
                    <td className="py-4 px-5 text-stone-700 font-mono text-xs">
                      {new Date(inv.created_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-4 px-5 text-stone-600">
                      {inv.customer_name || 'Walk-in Customer'}
                    </td>
                    <td className="py-4 px-5 text-stone-800 font-semibold">
                      {inv.cashier_name || `User #${inv.cashier_id}`}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-cafe-dark text-base">
                      ₹{parseFloat(inv.grand_total).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-bold font-mono rounded-full ${
                        (inv.print_count || 0) > 0
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-stone-100 text-stone-500 border border-stone-300'
                      }`}>
                        {inv.print_count || 0}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-stone-600 font-mono text-xs whitespace-nowrap">
                      {inv.last_printed_at
                        ? new Date(inv.last_printed_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Never'}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenReceipt(inv)}
                        className="px-4 py-2 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-xs shadow transition flex items-center space-x-1.5 ml-auto"
                      >
                        <span>🖨️</span>
                        <span>View / Reprint</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Receipt Preview & Reprint Modal */}
      {selectedInvoice && (
        <ReceiptPreviewModal
          invoice={selectedInvoice}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            fetchInvoices();
          }}
          onAuditUpdate={handleAuditUpdate}
        />
      )}
    </div>
  );
}
