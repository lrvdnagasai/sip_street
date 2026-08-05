import { create } from 'zustand';
import billingService from '../services/billingService';
import categoryService from '../services/categoryService';

export const useBillingStore = create((set, get) => ({
  products: [],
  categories: [],
  cartItems: [],
  selectedCategoryId: '',
  searchQuery: '',
  paymentMode: 'CASH',
  amountReceived: '',
  customerName: 'Walk-in Customer',
  isLoading: false,
  isSubmitting: false,
  error: null,
  lastCompletedInvoice: null,

  fetchBillingData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [prods, cats] = await Promise.all([
        billingService.getBillingProducts(),
        categoryService.getCategories(false),
      ]);
      set({ products: prods, categories: cats, isLoading: false });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to load POS terminal data.';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setSelectedCategory: (categoryId) => {
    set({ selectedCategoryId: categoryId });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  addToCart: (product) => {
    const { cartItems } = get();
    const existingIndex = cartItems.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      const currentQty = updated[existingIndex].quantity;
      if (currentQty < 999) {
        const newQty = currentQty + 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: newQty * parseFloat(product.price),
        };
        set({ cartItems: updated });
      }
    } else {
      set({
        cartItems: [
          ...cartItems,
          {
            product,
            quantity: 1,
            lineTotal: parseFloat(product.price),
          },
        ],
      });
    }

    // Default amount received to total if using Cash or Exact
    get().autoUpdateAmountReceived();
  },

  updateQuantity: (productId, delta) => {
    const { cartItems } = get();
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > 999) return item;
          return {
            ...item,
            quantity: newQty,
            lineTotal: newQty * parseFloat(item.product.price),
          };
        }
        return item;
      })
      .filter(Boolean);

    set({ cartItems: updated });
    get().autoUpdateAmountReceived();
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.product.id !== productId),
    }));
    get().autoUpdateAmountReceived();
  },

  clearCart: () => {
    set({
      cartItems: [],
      amountReceived: '',
      error: null,
    });
  },

  setPaymentMode: (mode) => {
    set({ paymentMode: mode });
    get().autoUpdateAmountReceived(mode);
  },

  setAmountReceived: (val) => {
    set({ amountReceived: val });
  },

  setCustomerName: (name) => {
    set({ customerName: name });
  },

  autoUpdateAmountReceived: (mode = get().paymentMode) => {
    const grandTotal = get().getGrandTotal();
    if (mode === 'UPI' || mode === 'CARD') {
      set({ amountReceived: grandTotal.toFixed(2) });
    }
  },

  getSubtotal: () => {
    return get().cartItems.reduce((acc, item) => acc + item.lineTotal, 0);
  },

  getGrandTotal: () => {
    return get().getSubtotal();
  },

  getBalanceAmount: () => {
    const total = get().getGrandTotal();
    const received = parseFloat(get().amountReceived) || 0;
    return received - total;
  },

  completeInvoice: async () => {
    const { cartItems, paymentMode, amountReceived, customerName, getGrandTotal } = get();

    if (cartItems.length === 0) {
      set({ error: 'Cart is empty. Please add products before checkout.' });
      return;
    }

    const total = getGrandTotal();
    const received = parseFloat(amountReceived) || 0;

    if (received < total) {
      set({ error: `Amount received (₹${received.toFixed(2)}) is less than Grand Total (₹${total.toFixed(2)}).` });
      return;
    }

    set({ isSubmitting: true, error: null });

    const payload = {
      items: cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      payment_mode: paymentMode,
      amount_received: received,
      customer_name: customerName.trim() || 'Walk-in Customer',
    };

    try {
      const invoice = await billingService.createInvoice(payload);
      set({
        lastCompletedInvoice: invoice,
        cartItems: [],
        amountReceived: '',
        customerName: 'Walk-in Customer',
        isSubmitting: false,
      });
      return invoice;
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to complete invoice.';
      set({ error: errorMessage, isSubmitting: false });
      throw new Error(errorMessage);
    }
  },

  closeReceiptModal: () => {
    set({ lastCompletedInvoice: null });
  },

  clearError: () => set({ error: null }),
}));

export default useBillingStore;
