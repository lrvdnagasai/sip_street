import { create } from 'zustand';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

export const useProductStore = create((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,
  error: null,

  filters: {
    categoryId: '',
    productType: '',
    isAvailable: '',
    includeInactive: true,
    search: '',
  },

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
    get().fetchProducts();
  },

  resetFilters: () => {
    set({
      filters: {
        categoryId: '',
        productType: '',
        isAvailable: '',
        includeInactive: true,
        search: '',
      },
    });
    get().fetchProducts();
  },

  fetchCategoriesForFilter: async () => {
    try {
      const data = await categoryService.getCategories(true);
      set({ categories: data });
    } catch (err) {
      console.error('Failed to fetch categories for filter:', err);
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    const { filters } = get();

    const params = {};
    if (filters.categoryId) params.category_id = filters.categoryId;
    if (filters.productType) params.product_type = filters.productType;
    if (filters.isAvailable !== '') params.is_available = filters.isAvailable === 'true';
    if (filters.includeInactive) params.include_inactive = true;
    if (filters.search) params.search = filters.search.trim();

    try {
      const data = await productService.getProducts(params);
      set({ products: data, isLoading: false });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to fetch products.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const newProduct = await productService.createProduct(productData);
      await get().fetchProducts();
      return newProduct;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to create product.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productService.updateProduct(id, productData);
      await get().fetchProducts();
      return updated;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to update product.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  toggleAvailability: async (id, currentAvailableStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await productService.toggleAvailability(id, !currentAvailableStatus);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to change availability.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  toggleActiveStatus: async (id, currentActiveStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updated = currentActiveStatus
        ? await productService.disableProduct(id)
        : await productService.enableProduct(id);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        isLoading: false,
      }));
      return updated;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to update product status.';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useProductStore;
