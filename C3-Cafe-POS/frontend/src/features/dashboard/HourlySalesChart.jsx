import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function HourlySalesChart({ hourlySales = [] }) {
  const chartData = hourlySales.map((item) => ({
    hour: item.hour,
    sales: parseFloat(item.sales) || 0,
    orders: item.order_count || 0,
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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col h-80 select-none">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Hourly Sales Distribution</h2>
          <p className="text-[11px] text-stone-500">Sales volume across cafe operating hours (08:00 - 22:00)</p>
        </div>
        <span className="text-xl">📈</span>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
            <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill="#5C3A21" radius={[6, 6, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
