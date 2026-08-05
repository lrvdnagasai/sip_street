import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

export default function ExpensesTab({ expenseReport }) {
  const totalExpenses = expenseReport ? parseFloat(expenseReport.total_expenses) : 0;
  const totalCount = expenseReport ? expenseReport.total_count : 0;
  const categories = expenseReport?.category_breakdown || [];
  const trendData = expenseReport?.trend_data || [];

  const COLORS = ['#5C3A21', '#C89B3C', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#6B7280'];

  const chartData = trendData.map((d) => ({
    label: d.label,
    expenses: parseFloat(d.expenses) || 0,
  }));

  const pieData = categories.map((c, i) => ({
    name: c.category.replace('_', ' '),
    value: parseFloat(c.amount) || 0,
    percentage: c.percentage,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
        <div className="p-4 rounded-2xl border bg-rose-500/10 border-rose-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Operational Expenses</span>
            <div className="text-2xl font-bold font-mono text-rose-900 mt-1">₹{totalExpenses.toFixed(2)}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💸</span>
        </div>

        <div className="p-4 rounded-2xl border bg-stone-500/10 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Expense Records Count</span>
            <div className="text-2xl font-bold font-mono text-stone-900 mt-1">{totalCount}</div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📋</span>
        </div>
      </div>

      {/* Grid: Expense Category Pie & Expense Trend Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        {/* Category Breakdown Pie Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col">
          <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider mb-2">Category Breakdown</h3>
          <div className="flex-1 flex items-center justify-between min-h-0">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    isAnimationActive={false}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2 overflow-y-auto max-h-56 pr-2 text-xs">
              {pieData.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px]">
                  <div className="flex items-center space-x-1.5 font-bold text-stone-800">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                    <span className="truncate max-w-[90px]">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-stone-900">₹{p.value.toFixed(2)} ({p.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Trend Bar Chart */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 h-80 flex flex-col">
          <h3 className="text-sm font-bold text-coffee-brown uppercase tracking-wider mb-2">Expense Daily Trend</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="expenses" fill="#EF4444" radius={[6, 6, 0, 0]} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
