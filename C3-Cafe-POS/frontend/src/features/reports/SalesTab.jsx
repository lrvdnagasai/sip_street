import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SalesTab({ salesReport }) {
  const totalSales = salesReport ? parseFloat(salesReport.total_sales) : 0;
  const totalOrders = salesReport ? salesReport.total_orders : 0;
  const avgBill = salesReport ? parseFloat(salesReport.average_bill) : 0;
  const productsSold = salesReport ? salesReport.products_sold : 0;
  const trendData = salesReport?.trend_data || [];

  const chartData = trendData.map((d) => ({
    label: d.label,
    sales: parseFloat(d.sales) || 0,
    orders: d.orders || 0,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-stone-700 font-mono space-y-1">
          <p className="font-bold text-amber-200">{label}</p>
          <p>Sales: ₹{data.sales.toFixed(2)}</p>
          <p>Orders: {data.orders}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-1">₹{totalSales.toFixed(2)}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💰</span>
        </div>

        <div className="p-4 rounded-2xl border bg-coffee-brown/10 border-amber-900/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Orders</span>
            <div className="text-2xl font-bold font-mono text-coffee-brown mt-1">{totalOrders}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">🛍️</span>
        </div>

        <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Average Bill Value</span>
            <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">₹{avgBill.toFixed(2)}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📊</span>
        </div>

        <div className="p-4 rounded-2xl border bg-stone-500/10 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Products Sold</span>
            <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{productsSold}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">☕</span>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col select-none">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Sales Revenue Trend</h3>
            <p className="text-[11px] text-stone-500">Gross sales volume across selected time period</p>
          </div>
          <span className="text-xl">📈</span>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="#5C3A21" radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales Trend Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-coffee-brown uppercase tracking-wider">
          Sales Breakup Log
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Period / Time</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {chartData.map((row, idx) => (
                <tr key={idx} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 px-4 font-mono font-bold text-stone-800">{row.label}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-stone-600">{row.orders}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-coffee-brown">
                    ₹{row.sales.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
