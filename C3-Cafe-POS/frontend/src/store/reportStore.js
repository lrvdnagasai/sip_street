import { create } from 'zustand';
import reportService from '../services/reportService';
import { exportToCSV } from '../utils/csvExport';

export const useReportStore = create((set, get) => ({
  activeTab: 'SALES', // SALES, EXPENSES, PROFIT, PRODUCTS, CATEGORIES, CASHIERS, PAYMENTS
  filterType: 'TODAY',
  startDate: '',
  endDate: '',
  quickSummary: null,
  salesReport: null,
  expenseReport: null,
  profitReport: null,
  productReport: null,
  categoryReport: null,
  cashierReport: null,
  paymentReport: null,
  isLoading: false,
  error: null,

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    get().fetchActiveReportData();
  },

  setFilterType: (type) => {
    set({ filterType: type });
    get().fetchAllReports();
  },

  setCustomDates: (sDate, eDate) => {
    set({ startDate: sDate, endDate: eDate, filterType: 'CUSTOM' });
    get().fetchAllReports();
  },

  fetchActiveReportData: async () => {
    const { activeTab, filterType, startDate, endDate } = get();
    set({ isLoading: true, error: null });

    const params = { filter_type: filterType };
    if (filterType === 'CUSTOM') {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }

    try {
      if (activeTab === 'SALES') {
        const data = await reportService.getSalesReport(params);
        set({ salesReport: data, isLoading: false });
      } else if (activeTab === 'EXPENSES') {
        const data = await reportService.getExpenseReport(params);
        set({ expenseReport: data, isLoading: false });
      } else if (activeTab === 'PROFIT') {
        const data = await reportService.getProfitReport(params);
        set({ profitReport: data, isLoading: false });
      } else if (activeTab === 'PRODUCTS') {
        const data = await reportService.getProductReport(params);
        set({ productReport: data, isLoading: false });
      } else if (activeTab === 'CATEGORIES') {
        const data = await reportService.getCategoryReport(params);
        set({ categoryReport: data, isLoading: false });
      } else if (activeTab === 'CASHIERS') {
        const data = await reportService.getCashierReport(params);
        set({ cashierReport: data, isLoading: false });
      } else if (activeTab === 'PAYMENTS') {
        const data = await reportService.getPaymentReport(params);
        set({ paymentReport: data, isLoading: false });
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch report data.';
      set({ error: msg, isLoading: false });
    }
  },

  fetchAllReports: async () => {
    const { filterType, startDate, endDate } = get();
    set({ isLoading: true, error: null });

    const params = { filter_type: filterType };
    if (filterType === 'CUSTOM') {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }

    try {
      const [s, e, p, prd, c, csh, pay] = await Promise.all([
        reportService.getSalesReport(params),
        reportService.getExpenseReport(params),
        reportService.getProfitReport(params),
        reportService.getProductReport(params),
        reportService.getCategoryReport(params),
        reportService.getCashierReport(params),
        reportService.getPaymentReport(params),
      ]);

      set({
        salesReport: s,
        expenseReport: e,
        profitReport: p,
        productReport: prd,
        categoryReport: c,
        cashierReport: csh,
        paymentReport: pay,
        isLoading: false,
      });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch reports.';
      set({ error: msg, isLoading: false });
    }
  },

  exportCurrentTabToCSV: () => {
    const { activeTab, salesReport, expenseReport, profitReport, productReport, categoryReport, cashierReport, paymentReport } = get();

    if (activeTab === 'SALES' && salesReport?.trend_data) {
      exportToCSV(salesReport.trend_data, 'Sales_Report.csv');
    } else if (activeTab === 'EXPENSES' && expenseReport?.category_breakdown) {
      exportToCSV(expenseReport.category_breakdown, 'Expense_Report.csv');
    } else if (activeTab === 'PROFIT' && profitReport?.trend_data) {
      exportToCSV(profitReport.trend_data, 'Net_Profit_Report.csv');
    } else if (activeTab === 'PRODUCTS' && productReport?.top_products) {
      exportToCSV(productReport.top_products, 'Product_Performance_Report.csv');
    } else if (activeTab === 'CATEGORIES' && categoryReport?.items) {
      exportToCSV(categoryReport.items, 'Category_Performance_Report.csv');
    } else if (activeTab === 'CASHIERS' && cashierReport?.items) {
      exportToCSV(cashierReport.items, 'Cashier_Performance_Report.csv');
    } else if (activeTab === 'PAYMENTS' && paymentReport?.items) {
      exportToCSV(paymentReport.items, 'Payment_Breakdown_Report.csv');
    } else {
      alert('No data available to export.');
    }
  },

  clearError: () => set({ error: null }),
}));

export default useReportStore;
