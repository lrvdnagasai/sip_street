import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PaymentBreakdownWidget({ paymentSummary }) {
  const breakdown = paymentSummary?.breakdown || [];
  const total = paymentSummary ? parseFloat(paymentSummary.total_amount) : 0;

  const COLORS = {
    CASH: '#5C3A21',
    UPI: '#C89B3C',
    CARD: '#3B82F6',
  };

  const chartData = breakdown.map((b) => ({
    name: b.mode,
    value: parseFloat(b.amount) || 0,
    percentage: b.percentage,
    count: b.count,
    color: COLORS[b.mode] || '#78716C',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-stone-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-stone-700 font-mono space-y-1">
          <p className="font-bold text-amber-200">{data.name}</p>
          <p>Amount: ₹{data.value.toFixed(2)}</p>
          <p>Share: {data.percentage}%</p>
          <p>Orders: {data.count}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col h-80 select-none">
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Payment Breakdown</h2>
          <p className="text-[11px] text-stone-500">Total: ₹{total.toFixed(2)}</p>
        </div>
        <span className="text-xl">💳</span>
      </div>

      <div className="flex-1 flex items-center justify-between min-h-0">
        {/* Pie / Donut Chart */}
        <div className="w-1/2 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                stroke="#fff"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Breakdown List */}
        <div className="w-1/2 pl-3 space-y-3 font-medium text-xs">
          {chartData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <div className="flex items-center space-x-1.5 font-bold text-stone-800">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}</span>
                </div>
                <span className="font-mono font-bold text-stone-900">
                  ₹{item.value.toFixed(2)} ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
