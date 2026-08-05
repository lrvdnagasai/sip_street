import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useDashboardStore from '../store/dashboardStore';

import DashboardFilterBar from '../features/dashboard/DashboardFilterBar';
import SummaryCards from '../features/dashboard/SummaryCards';
import HourlySalesChart from '../features/dashboard/HourlySalesChart';
import PaymentBreakdownWidget from '../features/dashboard/PaymentBreakdownWidget';
import TopProductsWidget from '../features/dashboard/TopProductsWidget';
import RecentTransactionsWidget from '../features/dashboard/RecentTransactionsWidget';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    summary,
    paymentSummary,
    topProducts,
    hourlySales,
    recentTransactions,
    autoRefresh,
    isLoading,
    error,
    fetchDashboardData,
    clearError,
  } = useDashboardStore();

  // CASHIER Role restriction: Redirect cashiers to Billing page
  if (user && user.role === 'CASHIER') {
    return <Navigate to="/billing" replace />;
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh interval (30 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 select-none">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Business Performance Dashboard</h1>
          <p className="text-xs text-stone-600">Real-time cafe sales, order metrics, and payment analytics</p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => navigate('/backup')}
            className="h-10 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-xs transition flex items-center space-x-1.5"
          >
            <span>🛡️</span>
            <span>Quick Backup</span>
          </button>
          <button
            onClick={() => navigate('/reports')}
            className="h-10 px-5 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-xs shadow-xs transition flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Open Reports & BI</span>
            <span>&rarr;</span>
          </button>
        </div>
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

      {/* Date Filter & Control Bar */}
      <DashboardFilterBar />

      {/* Summary KPI Cards */}
      <SummaryCards summary={summary} />

      {/* Analytics Grid Row 1: Hourly Sales Chart & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <HourlySalesChart hourlySales={hourlySales} />
        </div>
        <div className="lg:col-span-1">
          <PaymentBreakdownWidget paymentSummary={paymentSummary} />
        </div>
      </div>

      {/* Analytics Grid Row 2: Top Products & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProductsWidget topProducts={topProducts} />
        <RecentTransactionsWidget recentTransactions={recentTransactions} />
      </div>
    </div>
  );
}
