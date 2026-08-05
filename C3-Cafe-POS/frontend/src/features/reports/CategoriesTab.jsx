import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function CategoriesTab({ categoryReport }) {
  const items = categoryReport?.items || [];
  const topCategory = categoryReport?.top_category_name || 'N/A';

  const chartData = items.map((c) => ({
    name: c.category_name,
    revenue: parseFloat(c.revenue) || 0,
    orders: c.total_orders,
    qty: c.quantity_sold,
  }));

  return (
    <div className="space-y-6 select-none">
      {/* Top Category Card */}
      <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-200 shadow-xs flex items-center justify-between max-w-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Top Performing Category</span>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1">{topCategory}</div>
        </div>
        <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">👑</span>
      </div>

      {/* Category Revenue Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Revenue by Category</h3>
            <p className="text-[11px] text-stone-500">Sales volume across menu categories</p>
          </div>
          <span className="text-xl">📂</span>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#5C3A21" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-coffee-brown uppercase tracking-wider">
          Category Performance Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-center">Items Sold</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
                <th className="py-3 px-4 text-right">Share (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {items.map((c, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-4 font-bold text-cafe-dark">{c.category_name}</td>
                  <td className="py-3 px-4 text-center font-mono text-stone-700">{c.total_orders}</td>
                  <td className="py-3 px-4 text-center font-mono text-stone-700">{c.quantity_sold}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-coffee-brown">
                    ₹{parseFloat(c.revenue).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-900">{c.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
