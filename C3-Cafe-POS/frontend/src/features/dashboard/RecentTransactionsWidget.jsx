import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function RecentTransactionsWidget({ recentTransactions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col select-none">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Recent Transactions</h2>
          <p className="text-[11px] text-stone-500">Latest 10 completed customer billing invoices</p>
        </div>
        <button
          onClick={() => navigate('/receipts')}
          className="text-xs font-bold text-coffee-brown hover:underline flex items-center space-x-1"
        >
          <span>View All</span>
          <span>&rarr;</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs font-semibold">
            No recent transactions recorded.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Time</th>
                <th className="pb-2">Cashier</th>
                <th className="pb-2 text-center">Payment</th>
                <th className="pb-2 text-center">Prints</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 font-mono font-bold text-coffee-brown">
                    {tx.invoice_number}
                  </td>
                  <td className="py-2.5 text-stone-600 font-mono text-[11px]">
                    {new Date(tx.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 font-semibold text-stone-800 truncate max-w-[100px]">
                    {tx.cashier_name || 'Cashier'}
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-100 text-stone-800 border border-stone-300">
                      {tx.payment_mode}
                    </span>
                  </td>
                  <td className="py-2.5 text-center font-mono font-bold text-stone-600">
                    {tx.print_count || 0}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-cafe-dark">
                    ₹{parseFloat(tx.grand_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
