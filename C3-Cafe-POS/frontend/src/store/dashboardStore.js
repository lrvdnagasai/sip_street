import { create } from 'zustand';
import dashboardService from '../services/dashboardService';

export const useDashboardStore = create((set, get) => ({
  filterType: 'TODAY',
  startDate: '',
  endDate: '',
  summary: null,
  paymentSummary: null,
  topProducts: [],
  hourlySales: [],
  recentTransactions: [],
  autoRefresh: true,
  isLoading: false,
  lastRefreshedAt: null,
  error: null,

  setFilterType: (type) => {
    set({ filterType: type });
    get().fetchDashboardData();
  },

  setCustomDates: (sDate, eDate) => {
    set({ startDate: sDate, endDate: eDate, filterType: 'CUSTOM' });
    get().fetchDashboardData();
  },

  toggleAutoRefresh: () => {
    set((state) => ({ autoRefresh: !state.autoRefresh }));
  },

  fetchDashboardData: async () => {
    const { filterType, startDate, endDate } = get();
    set({ isLoading: true, error: null });

    const params = {
      filter_type: filterType,
    };
    if (filterType === 'CUSTOM') {
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
    }

    try {
      const [sum, pay, top, hourly, txs] = await Promise.all([
        dashboardService.getSummary(params),
        dashboardService.getPaymentSummary(params),
        dashboardService.getTopProducts(params),
        dashboardService.getHourlySales(params),
        dashboardService.getRecentTransactions(10),
      ]);

      set({
        summary: sum,
        paymentSummary: pay,
        topProducts: top,
        hourlySales: hourly,
        recentTransactions: txs,
        isLoading: false,
        lastRefreshedAt: new Date(),
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to fetch dashboard data.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useDashboardStore;
