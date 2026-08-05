import React, { useEffect, useMemo } from 'react';
import useBillingStore from '../store/billingStore';
import ReceiptModal from '../features/billing/ReceiptModal';

export default function BillingPage() {
  const {
    products,
    categories,
    cartItems,
    selectedCategoryId,
    searchQuery,
    paymentMode,
    amountReceived,
    customerName,
    isLoading,
    isSubmitting,
    error,
    lastCompletedInvoice,
    fetchBillingData,
    setSelectedCategory,
    setSearchQuery,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setPaymentMode,
    setAmountReceived,
    setCustomerName,
    getSubtotal,
    getGrandTotal,
    getBalanceAmount,
    completeInvoice,
    closeReceiptModal,
    clearError,
  } = useBillingStore();

  useEffect(() => {
    fetchBillingData();
  }, []);

  // Filter products by selected category and search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = !selectedCategoryId || p.category_id === Number(selectedCategoryId);
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const grandTotal = getGrandTotal();
  const balance = getBalanceAmount();
  const numReceived = parseFloat(amountReceived) || 0;
  const canComplete = cartItems.length > 0 && numReceived >= grandTotal && !isSubmitting;

  const getPlaceholderIcon = (type) => {
    switch (type) {
      case 'BEVERAGE':
        return '☕';
      case 'VEG':
        return '🥗';
      case 'NON_VEG':
        return '🍗';
      default:
        return '🍽️';
    }
  };

  const handleQuickCash = (amount) => {
    if (amount === 'EXACT') {
      setAmountReceived(grandTotal.toFixed(2));
    } else {
      setAmountReceived(amount.toString());
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 select-none overflow-hidden">
      {/* Error Banner */}
      {error && (
        <div className="lg:col-span-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3 flex justify-between items-center shrink-0">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold text-rose-900 leading-none">
            &times;
          </button>
        </div>
      )}

      {/* LEFT COLUMN: Categories Navigation Bar */}
      <div className="w-full lg:w-48 bg-white rounded-2xl p-3 shadow-sm border border-stone-200 shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-32 lg:max-h-full">
        <div className="hidden lg:block text-xs font-bold text-stone-500 uppercase tracking-wider px-2 py-1">
          Categories
        </div>

        <button
          onClick={() => setSelectedCategory('')}
          className={`h-11 px-4 rounded-xl font-bold text-xs tracking-wide transition shrink-0 text-left flex items-center justify-between ${
            selectedCategoryId === ''
              ? 'bg-coffee-brown text-white shadow-sm'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <span>All Items</span>
          <span className="text-[10px] opacity-80">({products.length})</span>
        </button>

        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`h-11 px-4 rounded-xl font-bold text-xs tracking-wide transition shrink-0 text-left flex items-center justify-between ${
                selectedCategoryId === cat.id
                  ? 'bg-coffee-brown text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              <span className="text-[10px] opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* MIDDLE COLUMN: Product Search & Catalog Grid */}
      <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="relative mb-3 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active menu items or tap items to add..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          />
          <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-base">🔍</span>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="p-12 text-center text-stone-500 font-medium">
              <div className="w-6 h-6 border-2 border-coffee-brown border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              Loading catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-stone-500">
              <span className="text-3xl">☕</span>
              <p className="text-sm font-semibold mt-2">No active products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cartItems.find((i) => i.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`relative p-3 rounded-2xl border text-left transition flex flex-col justify-between h-28 active:scale-95 hover:shadow-md ${
                      inCart
                        ? 'border-coffee-brown bg-amber-50/60 ring-2 ring-coffee-brown/20'
                        : 'border-stone-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-coffee-brown text-white text-xs font-bold flex items-center justify-center shadow">
                        {inCart.quantity}
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{getPlaceholderIcon(product.product_type)}</span>
                      <span className="text-xs font-mono font-bold text-coffee-brown bg-amber-100/80 px-2 py-0.5 rounded-lg">
                        ₹{parseFloat(product.price).toFixed(2)}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-cafe-dark truncate line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400 truncate">
                        {product.sku}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Current Bill & Checkout Panel */}
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden shrink-0">
        {/* Bill Panel Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-wide">Current Bill</h2>
            <p className="text-[11px] text-stone-400">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in order
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-300 hover:text-rose-100 font-semibold px-2 py-1 rounded bg-stone-800 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Customer Name Input */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 shrink-0">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name (Optional)"
            className="w-full h-9 px-3 rounded-lg border border-stone-300 text-xs text-cafe-dark font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-coffee-brown"
          />
        </div>

        {/* Bill Items List */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-stone-100">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center space-y-2">
              <span className="text-3xl">🛒</span>
              <p className="text-xs font-semibold">Bill is empty</p>
              <p className="text-[11px] text-stone-400">
                Tap product cards from the catalog to build an order.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product.id} className="py-2 flex items-center justify-between text-xs">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-cafe-dark truncate">{item.product.name}</div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    ₹{parseFloat(item.product.price).toFixed(2)} each
                  </div>
                </div>

                {/* Quantity Buttons */}
                <div className="flex items-center space-x-1 border border-stone-300 rounded-lg p-0.5 bg-stone-50">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center transition"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-bold font-mono text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, 1)}
                    className="w-6 h-6 rounded bg-white hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center justify-center transition"
                  >
                    +
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="w-20 text-right font-mono font-bold text-stone-900 pl-2">
                  ₹{item.lineTotal.toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-stone-400 hover:text-rose-600 font-bold ml-1 text-base leading-none"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Payment Section */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0">
          {/* Total Display */}
          <div className="flex justify-between items-center bg-amber-100/70 p-3 rounded-xl border border-amber-200">
            <span className="text-xs font-bold uppercase text-stone-700 tracking-wider">Grand Total</span>
            <span className="text-xl font-bold font-mono text-coffee-brown">
              ₹{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5">
            {['CASH', 'UPI', 'CARD'].map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode)}
                className={`h-9 rounded-lg font-bold text-xs transition ${
                  paymentMode === mode
                    ? 'bg-coffee-brown text-white shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Quick Preset Cash Buttons */}
          {paymentMode === 'CASH' && (
            <div className="flex space-x-1">
              {[50, 100, 200, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleQuickCash(preset)}
                  className="flex-1 h-7 text-[11px] font-bold rounded border border-stone-300 bg-white hover:bg-amber-50 text-stone-700 transition"
                >
                  ₹{preset}
                </button>
              ))}
              <button
                onClick={() => handleQuickCash('EXACT')}
                className="flex-1 h-7 text-[11px] font-bold rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-coffee-brown transition"
              >
                Exact
              </button>
            </div>
          )}

          {/* Amount Received & Balance */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block font-bold text-stone-600 text-[10px] uppercase mb-0.5">
                Amount Tendered (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="0.00"
                className="w-full h-10 px-3 rounded-lg border border-stone-300 font-mono font-bold text-sm bg-white focus:outline-none focus:ring-1 focus:ring-coffee-brown"
              />
            </div>
            <div>
              <label className="block font-bold text-stone-600 text-[10px] uppercase mb-0.5">
                Change Due (₹)
              </label>
              <div
                className={`w-full h-10 px-3 rounded-lg border font-mono font-bold text-sm flex items-center ${
                  balance < 0
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}
              >
                ₹{balance >= 0 ? balance.toFixed(2) : '0.00'}
              </div>
            </div>
          </div>

          {/* Complete Bill Action Button */}
          <button
            onClick={completeInvoice}
            disabled={!canComplete}
            className="w-full h-12 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-98 text-white font-bold text-sm shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving Bill...</span>
              </>
            ) : (
              <span>Complete & Save Bill</span>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal invoice={lastCompletedInvoice} onClose={closeReceiptModal} />
    </div>
  );
}
