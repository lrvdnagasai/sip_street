import { create } from 'zustand';
import expenseService from '../services/expenseService';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  summary: null,
  categoryFilter: '',
  paymentModeFilter: '',
  searchQuery: '',
  startDate: '',
  endDate: '',
  includeInactive: false,
  isLoading: false,
  error: null,
  isModalOpen: false,
  editingExpense: null,

  setCategoryFilter: (category) => {
    set({ categoryFilter: category });
    get().fetchExpenses();
  },

  setPaymentModeFilter: (mode) => {
    set({ paymentModeFilter: mode });
    get().fetchExpenses();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchExpenses();
  },

  setDateRange: (sDate, eDate) => {
    set({ startDate: sDate, endDate: eDate });
    get().fetchExpenses();
  },

  toggleIncludeInactive: () => {
    set((state) => ({ includeInactive: !state.includeInactive }));
    get().fetchExpenses();
  },

  fetchExpenses: async () => {
    const { categoryFilter, paymentModeFilter, searchQuery, startDate, endDate, includeInactive } = get();
    set({ isLoading: true, error: null });

    const params = {};
    if (categoryFilter) params.category = categoryFilter;
    if (paymentModeFilter) params.payment_mode = paymentModeFilter;
    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (includeInactive) params.include_inactive = true;

    try {
      const [data, sum] = await Promise.all([
        expenseService.getExpenses(params),
        expenseService.getExpenseSummary(),
      ]);
      set({ expenses: data, summary: sum, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to fetch expenses.';
      set({ error: msg, isLoading: false });
    }
  },

  openAddModal: () => set({ isModalOpen: true, editingExpense: null, error: null }),

  openEditModal: (expense) => set({ isModalOpen: true, editingExpense: expense, error: null }),

  closeModal: () => set({ isModalOpen: false, editingExpense: null, error: null }),

  saveExpense: async (formData) => {
    const { editingExpense, fetchExpenses } = get();
    set({ isLoading: true, error: null });

    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      set({ isModalOpen: false, editingExpense: null });
      await fetchExpenses();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save expense.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  toggleExpenseActive: async (expense) => {
    const { fetchExpenses } = get();
    set({ isLoading: true, error: null });

    try {
      if (expense.is_active) {
        await expenseService.disableExpense(expense.id);
      } else {
        await expenseService.enableExpense(expense.id);
      }
      await fetchExpenses();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update expense status.';
      set({ error: msg, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useExpenseStore;
