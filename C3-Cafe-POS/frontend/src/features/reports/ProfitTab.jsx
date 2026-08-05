import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export default function ProfitTab({ profitReport }) {
  const grossSales = profitReport ? parseFloat(profitReport.gross_sales) : 0;
  const totalExpenses = profitReport ? parseFloat(profitReport.total_expenses) : 0;
  const netProfit = profitReport ? parseFloat(profitReport.net_profit) : 0;
  const profitMargin = profitReport ? profitReport.profit_margin_pct : 0;
  const trendData = profitReport?.trend_data || [];

  const chartData = trendData.map((d) => ({
    label: d.label,
    Sales: parseFloat(d.gross_sales) || 0,
    Expenses: parseFloat(d.expenses) || 0,
    NetProfit: parseFloat(d.net_profit) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 select-none">
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-1">₹{grossSales.toFixed(2)}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💰</span>
        </div>

        <div className="p-4 rounded-2xl border bg-rose-500/10 border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Expenses</span>
            <div className="text-2xl font-bold font-mono text-rose-900 mt-1">₹{totalExpenses.toFixed(2)}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💸</span>
        </div>

        <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Net Profit</span>
            <div className={`text-2xl font-bold font-mono mt-1 ${netProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
              ₹{netProfit.toFixed(2)}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📈</span>
        </div>

        <div className="p-4 rounded-2xl border bg-indigo-500/10 border-indigo-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Profit Margin</span>
            <div className="text-2xl font-bold font-mono text-indigo-900 mt-1">{profitMargin}%</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">🎯</span>
        </div>
      </div>

      {/* Sales vs Expenses vs Net Profit Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col select-none">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider">Gross Sales vs Expenses vs Net Profit</h3>
            <p className="text-[11px] text-stone-500">Comparative financial breakdown across selected period</p>
          </div>
          <span className="text-xl">📊</span>
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
              <Bar dataKey="Sales" fill="#5C3A21" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="NetProfit" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
