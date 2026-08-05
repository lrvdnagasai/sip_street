import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useReportStore from '../store/reportStore';

import ReportFilterBar from '../features/reports/ReportFilterBar';
import SalesTab from '../features/reports/SalesTab';
import ExpensesTab from '../features/reports/ExpensesTab';
import ProfitTab from '../features/reports/ProfitTab';
import ProductsTab from '../features/reports/ProductsTab';
import CategoriesTab from '../features/reports/CategoriesTab';
import CashiersTab from '../features/reports/CashiersTab';
import PaymentsTab from '../features/reports/PaymentsTab';

export default function ReportsPage() {
  const { user } = useAuthStore();
  const {
    activeTab,
    salesReport,
    expenseReport,
    profitReport,
    productReport,
    categoryReport,
    cashierReport,
    paymentReport,
    isLoading,
    error,
    setActiveTab,
    fetchAllReports,
    clearError,
  } = useReportStore();

  // CASHIER Role restriction: Redirect cashiers to Billing page
  if (user && user.role === 'CASHIER') {
    return <Navigate to="/billing" replace />;
  }

  useEffect(() => {
    fetchAllReports();
  }, []);

  const todaySales = salesReport ? parseFloat(salesReport.total_sales) : 0;
  const todayExp = expenseReport ? parseFloat(expenseReport.total_expenses) : 0;
  const todayProfit = todaySales - todayExp;
  const todayOrders = salesReport ? salesReport.total_orders : 0;
  const avgBill = salesReport ? parseFloat(salesReport.average_bill) : 0;

  const tabs = [
    { key: 'SALES', label: 'Sales Report', icon: '💰' },
    { key: 'EXPENSES', label: 'Expense Report', icon: '💸' },
    { key: 'PROFIT', label: 'Net Profit', icon: '📈' },
    { key: 'PRODUCTS', label: 'Product Performance', icon: '🏆' },
    { key: 'CATEGORIES', label: 'Category Performance', icon: '📂' },
    { key: 'CASHIERS', label: 'Cashier Performance', icon: '👨‍🍳' },
    { key: 'PAYMENTS', label: 'Payment Breakdown', icon: '💳' },
  ];

  return (
    <div className="space-y-6">
      {/* Printable Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 select-none">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Business Intelligence & Reports</h1>
          <p className="text-xs text-stone-600">Dynamic sales, expense, profitability, and operational performance reports</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center print:hidden">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Top Executive Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 select-none">
        <div className="p-3.5 bg-amber-500/10 border border-amber-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Today's Sales</span>
          <div className="text-lg font-bold font-mono text-amber-900 mt-0.5">₹{todaySales.toFixed(2)}</div>
        </div>

        <div className="p-3.5 bg-rose-500/10 border border-rose-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Today's Expenses</span>
          <div className="text-lg font-bold font-mono text-rose-900 mt-0.5">₹{todayExp.toFixed(2)}</div>
        </div>

        <div className="p-3.5 bg-emerald-500/10 border border-emerald-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Today's Net Profit</span>
          <div className={`text-lg font-bold font-mono mt-0.5 ${todayProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
            ₹{todayProfit.toFixed(2)}
          </div>
        </div>

        <div className="p-3.5 bg-coffee-brown/10 border border-amber-900/20 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Today's Orders</span>
          <div className="text-lg font-bold font-mono text-coffee-brown mt-0.5">{todayOrders}</div>
        </div>

        <div className="p-3.5 bg-stone-500/10 border border-stone-200 rounded-2xl shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Average Bill</span>
          <div className="text-lg font-bold font-mono text-stone-900 mt-0.5">₹{avgBill.toFixed(2)}</div>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <ReportFilterBar />

      {/* Report Category Navigation Tabs */}
      <div className="bg-stone-200/70 p-1.5 rounded-2xl flex flex-wrap gap-1 select-none print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === tab.key
                ? 'bg-white text-coffee-brown shadow-sm'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100/50'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="print:p-0">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 text-xs font-semibold animate-pulse">
            Generating business intelligence report...
          </div>
        ) : (
          <>
            {activeTab === 'SALES' && <SalesTab salesReport={salesReport} />}
            {activeTab === 'EXPENSES' && <ExpensesTab expenseReport={expenseReport} />}
            {activeTab === 'PROFIT' && <ProfitTab profitReport={profitReport} />}
            {activeTab === 'PRODUCTS' && <ProductsTab productReport={productReport} />}
            {activeTab === 'CATEGORIES' && <CategoriesTab categoryReport={categoryReport} />}
            {activeTab === 'CASHIERS' && <CashiersTab cashierReport={cashierReport} />}
            {activeTab === 'PAYMENTS' && <PaymentsTab paymentReport={paymentReport} />}
          </>
        )}
      </div>
    </div>
  );
}
