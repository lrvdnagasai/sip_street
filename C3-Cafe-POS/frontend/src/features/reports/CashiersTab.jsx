import React from 'react';

export default function CashiersTab({ cashierReport }) {
  const items = cashierReport?.items || [];

  return (
    <div className="space-y-6 select-none">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-coffee-brown uppercase tracking-wider flex items-center justify-between">
          <span>Cashier Staff Activity & Performance Log</span>
          <span>👨‍🍳</span>
        </div>
        <div className="overflow-x-auto">
          {items.length === 0 ? (
            <div className="p-12 text-center text-stone-400 text-xs font-semibold">
              No cashier sales activity recorded in selected period.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Cashier Name</th>
                  <th className="py-3 px-4 text-center">Orders Processed</th>
                  <th className="py-3 px-4 text-center">Receipt Prints</th>
                  <th className="py-3 px-4 text-right">Average Bill (₹)</th>
                  <th className="py-3 px-4 text-right">Total Generated Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {items.map((c) => (
                  <tr key={c.cashier_id} className="hover:bg-amber-50/40 transition">
                    <td className="py-3 px-4 font-bold text-cafe-dark">{c.cashier_name}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-800">{c.orders_processed}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-stone-600">{c.print_count}</td>
                    <td className="py-3 px-4 text-right font-mono text-stone-700">
                      ₹{parseFloat(c.average_bill).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-coffee-brown text-sm">
                      ₹{parseFloat(c.revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
