import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function PaymentsTab({ paymentReport }) {
  const items = paymentReport?.items || [];
  const totalAmount = paymentReport ? parseFloat(paymentReport.total_amount) : 0;

  const COLORS = {
    CASH: '#5C3A21',
    UPI: '#C89B3C',
    CARD: '#3B82F6',
  };

  const chartData = items.map((p) => ({
    name: p.mode,
    value: parseFloat(p.amount) || 0,
    percentage: p.percentage,
    count: p.count,
    color: COLORS[p.mode] || '#78716C',
  }));

  return (
    <div className="space-y-6 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Donut Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Payment Mode Share</h3>
            <span className="text-[11px] font-mono font-bold text-stone-500">Total: ₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex-1 flex items-center justify-between min-h-0">
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
                    outerRadius={65}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-1/2 space-y-3 font-medium text-xs pl-2">
              {chartData.map((p) => (
                <div key={p.name} className="space-y-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center space-x-1.5 font-bold text-stone-800">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                      <span>{p.name}</span>
                    </div>
                    <span className="font-mono font-bold text-stone-900">₹{p.value.toFixed(2)} ({p.percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${p.percentage}%`, backgroundColor: p.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Breakdown Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
          <div className="p-4 bg-stone-50 border-b border-stone-200 font-bold text-xs text-coffee-brown uppercase tracking-wider">
            Payment Method Statistics
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-center">Transactions</th>
                  <th className="py-3 px-4 text-right">Volume (₹)</th>
                  <th className="py-3 px-4 text-right">Share (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {items.map((p) => (
                  <tr key={p.mode} className="hover:bg-amber-50/40 transition">
                    <td className="py-3.5 px-4 font-bold text-cafe-dark">{p.mode}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-stone-800">{p.count}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-coffee-brown">
                      ₹{parseFloat(p.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-900">{p.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
