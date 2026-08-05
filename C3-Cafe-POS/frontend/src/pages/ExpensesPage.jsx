import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useExpenseStore from '../store/expenseStore';
import ExpenseModal from '../features/expenses/ExpenseModal';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'MILK', label: 'Milk Dairy' },
  { value: 'COFFEE', label: 'Coffee Beans' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'SALARY', label: 'Staff Salary' },
  { value: 'ELECTRICITY', label: 'Electricity Bill' },
  { value: 'RENT', label: 'Store Rent' },
  { value: 'INTERNET', label: 'Internet / WiFi' },
  { value: 'MAINTENANCE', label: 'Maintenance & Repairs' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

const PAYMENT_MODES = [
  { value: '', label: 'All Payment Modes' },
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

export default function ExpensesPage() {
  const { user } = useAuthStore();
  const {
    expenses,
    summary,
    categoryFilter,
    paymentModeFilter,
    searchQuery,
    startDate,
    endDate,
    includeInactive,
    isLoading,
    error,
    setCategoryFilter,
    setPaymentModeFilter,
    setSearchQuery,
    setDateRange,
    toggleIncludeInactive,
    fetchExpenses,
    openAddModal,
    openEditModal,
    toggleExpenseActive,
    clearError,
  } = useExpenseStore();

  // CASHIER Role restriction: Redirect cashiers to Billing page
  if (user && user.role === 'CASHIER') {
    return <Navigate to="/billing" replace />;
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  const todayExp = summary ? parseFloat(summary.todays_expenses) : 0;
  const monthExp = summary ? parseFloat(summary.this_month_expenses) : 0;
  const totalExp = summary ? parseFloat(summary.total_expenses) : 0;
  const avgDailyExp = summary ? parseFloat(summary.avg_daily_expense) : 0;

  return (
    <div className="space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Expense Management</h1>
          <p className="text-xs text-stone-600">Track and manage operational store expenditure</p>
        </div>
        <button
          onClick={openAddModal}
          className="h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-sm transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <span className="text-base leading-none">+</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Today's Expenses</span>
            <div className="text-2xl font-bold font-mono text-amber-900 mt-1">
              ₹{todayExp.toFixed(2)}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">💸</span>
        </div>

        <div className="p-4 rounded-2xl border bg-coffee-brown/10 border-amber-900/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">This Month Expenses</span>
            <div className="text-2xl font-bold font-mono text-coffee-brown mt-1">
              ₹{monthExp.toFixed(2)}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📅</span>
        </div>

        <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Expenses</span>
            <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">
              ₹{totalExp.toFixed(2)}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📊</span>
        </div>

        <div className="p-4 rounded-2xl border bg-stone-500/10 border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Avg Daily Expense</span>
            <div className="text-2xl font-bold font-mono text-stone-900 mt-1">
              ₹{avgDailyExp.toFixed(2)}
            </div>
          </div>
          <span className="text-3xl p-2 rounded-2xl bg-white/80 shadow-xs">📈</span>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Instant Search */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search description, receipt #, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-stone-300 text-xs font-medium text-cafe-dark focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50"
            />
            <span className="absolute left-3 top-2.5 text-stone-400 text-sm">🔍</span>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50 w-full md:w-auto"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Payment Mode Dropdown Filter */}
          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50 w-full md:w-auto"
          >
            {PAYMENT_MODES.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range & Inactive Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-500">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setDateRange(e.target.value, endDate)}
              className="h-8 px-2 rounded-lg border border-stone-300 text-xs font-medium bg-stone-50"
            />
            <span className="text-stone-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setDateRange(startDate, e.target.value)}
              className="h-8 px-2 rounded-lg border border-stone-300 text-xs font-medium bg-stone-50"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer font-semibold text-stone-700">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={toggleIncludeInactive}
              className="w-4 h-4 accent-coffee-brown rounded cursor-pointer"
            />
            <span>Show Disabled Expenses</span>
          </label>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 text-xs font-semibold animate-pulse">
            Loading operational expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-stone-400 text-xs font-semibold">
            No expenses found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-100/70 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`hover:bg-amber-50/40 transition ${
                      !exp.is_active ? 'opacity-50 bg-stone-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-stone-600 font-bold text-[11px]">
                      {exp.expense_date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-cafe-dark max-w-xs truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-stone-700">
                      {exp.payment_mode}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-500">
                      {exp.receipt_number || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          exp.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {exp.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-700 text-sm">
                      ₹{parseFloat(exp.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center space-x-2">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-[10px] transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleExpenseActive(exp)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                          exp.is_active
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {exp.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal Dialog */}
      <ExpenseModal />
    </div>
  );
}
