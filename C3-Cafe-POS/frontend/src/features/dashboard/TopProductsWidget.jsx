import React from 'react';

export default function TopProductsWidget({ topProducts = [] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col select-none">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Top Selling Products</h2>
          <p className="text-[11px] text-stone-500">Top 10 menu items ranked by quantity sold</p>
        </div>
        <span className="text-xl">🏆</span>
      </div>

      <div className="overflow-x-auto">
        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs font-semibold">
            No product sales recorded for this period.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="pb-2 w-8">#</th>
                <th className="pb-2">Product</th>
                <th className="pb-2 text-center">Qty Sold</th>
                <th className="pb-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {topProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 font-bold font-mono text-stone-400 text-[11px]">
                    #{idx + 1}
                  </td>
                  <td className="py-2.5 font-bold text-cafe-dark truncate max-w-[140px]">
                    {item.product_name}
                  </td>
                  <td className="py-2.5 text-center font-bold font-mono text-stone-800">
                    {item.quantity_sold}
                  </td>
                  <td className="py-2.5 text-right font-bold font-mono text-coffee-brown">
                    ₹{parseFloat(item.revenue).toFixed(2)}
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
