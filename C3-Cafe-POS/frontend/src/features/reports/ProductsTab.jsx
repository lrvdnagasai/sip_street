import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ProductsTab({ productReport }) {
  const topProducts = productReport?.top_products || [];
  const leastProducts = productReport?.least_products || [];

  const chartData = topProducts.map((p) => ({
    name: p.product_name,
    revenue: parseFloat(p.revenue) || 0,
    qty: p.quantity_sold,
  }));

  return (
    <div className="space-y-6">
      {/* Top Products Revenue Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col select-none">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Product Sales Revenue</h3>
            <p className="text-[11px] text-stone-500">Revenue contribution from top-performing menu items</p>
          </div>
          <span className="text-xl">🏆</span>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#C89B3C" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top vs Least Selling Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-200 font-bold text-xs text-amber-900 uppercase tracking-wider flex items-center justify-between">
            <span>Top 10 Selling Products</span>
            <span>🔥</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {topProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                    <td className="py-2 px-4 font-bold text-cafe-dark">{p.product_name}</td>
                    <td className="py-2 px-4 text-stone-600">{p.category_name}</td>
                    <td className="py-2 px-4 text-center font-mono font-bold text-stone-800">{p.quantity_sold}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-coffee-brown">
                      ₹{parseFloat(p.revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Least Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-4 bg-stone-100 border-b border-stone-200 font-bold text-xs text-stone-700 uppercase tracking-wider flex items-center justify-between">
            <span>Least Selling Products</span>
            <span>🧊</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Product</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {leastProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-stone-400">No additional products recorded.</td>
                  </tr>
                ) : (
                  leastProducts.map((p, idx) => (
                    <tr key={idx} className="hover:bg-stone-50 transition">
                      <td className="py-2 px-4 font-bold text-stone-700">{p.product_name}</td>
                      <td className="py-2 px-4 text-stone-500">{p.category_name}</td>
                      <td className="py-2 px-4 text-center font-mono font-bold text-stone-600">{p.quantity_sold}</td>
                      <td className="py-2 px-4 text-right font-mono font-bold text-stone-700">
                        ₹{parseFloat(p.revenue).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
