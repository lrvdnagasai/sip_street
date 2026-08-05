import { create } from 'zustand';
import categoryService from '../services/categoryService';

export const useCategoryStore = create((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  includeInactive: true,
  searchQuery: '',

  setIncludeInactive: (val) => {
    set({ includeInactive: val });
    get().fetchCategories(val);
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchCategories: async (includeInactive = get().includeInactive) => {
    set({ isLoading: true, error: null });
    try {
      const data = await categoryService.getCategories(includeInactive);
      set({ categories: data, isLoading: false });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to fetch categories.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      set((state) => ({
        categories: [...state.categories, newCategory].sort(
          (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)
        ),
        isLoading: false,
      }));
      return newCategory;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to create category.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateCategory: async (id, categoryData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await categoryService.updateCategory(id, categoryData);
      set((state) => ({
        categories: state.categories
          .map((c) => (c.id === id ? updated : c))
          .sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to update category.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  toggleCategoryStatus: async (id, currentActiveStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updated = currentActiveStatus
        ? await categoryService.disableCategory(id)
        : await categoryService.enableCategory(id);

      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? updated : c)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to update category status.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCategoryStore;
