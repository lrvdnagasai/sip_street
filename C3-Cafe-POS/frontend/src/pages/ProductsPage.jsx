import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useProductStore from '../store/productStore';
import ProductModal from '../features/products/ProductModal';

export default function ProductsPage() {
  const { user } = useAuthStore();
  const {
    products,
    categories,
    isLoading,
    error,
    filters,
    fetchProducts,
    fetchCategoriesForFilter,
    createProduct,
    updateProduct,
    toggleAvailability,
    toggleActiveStatus,
    setFilter,
    clearError,
  } = useProductStore();

  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchCategoriesForFilter();
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    if (selectedProduct) {
      await updateProduct(selectedProduct.id, productData);
    } else {
      await createProduct(productData);
    }
  };

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

  const getTypeBadge = (type) => {
    switch (type) {
      case 'BEVERAGE':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'VEG':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'NON_VEG':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Product Management</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Manage food and beverage menu items, pricing, availability, and categories.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-sm shadow transition flex items-center justify-center space-x-2 shrink-0"
          >
            <span className="text-lg font-bold">+</span>
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="font-bold text-rose-900 text-base leading-none">
            &times;
          </button>
        </div>
      )}

      {/* Control Bar (Instant Search + Multi-Filters) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Instant Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search by name, SKU, or description..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
            />
            <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-base select-none">
              🔍
            </span>
          </div>

          {/* Category Filter */}
          <select
            value={filters.categoryId}
            onChange={(e) => setFilter('categoryId', e.target.value)}
            className="h-11 px-3 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Product Type Filter */}
          <select
            value={filters.productType}
            onChange={(e) => setFilter('productType', e.target.value)}
            className="h-11 px-3 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          >
            <option value="">All Product Types</option>
            <option value="BEVERAGE">Beverages</option>
            <option value="VEG">Vegetarian</option>
            <option value="NON_VEG">Non-Vegetarian</option>
          </select>

          {/* Availability Filter */}
          <select
            value={filters.isAvailable}
            onChange={(e) => setFilter('isAvailable', e.target.value)}
            className="h-11 px-3 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          >
            <option value="">All Availability</option>
            <option value="true">Available Only</option>
            <option value="false">Unavailable Only</option>
          </select>
        </div>

        {/* Show Disabled Products Toggle for Admin */}
        {isAdmin && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-end">
            <label className="flex items-center space-x-2 text-xs font-semibold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.includeInactive}
                onChange={(e) => setFilter('includeInactive', e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-coffee-brown focus:ring-coffee-brown accent-coffee-brown"
              />
              <span>Show Disabled Products</span>
            </label>
          </div>
        )}
      </div>

      {/* Product List Table / Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="p-12 text-center text-stone-500 font-medium">
            <div className="w-6 h-6 border-2 border-coffee-brown border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading products...
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/70 text-coffee-brown mx-auto flex items-center justify-center text-3xl border border-amber-200">
              ☕
            </div>
            <h2 className="text-xl font-bold text-cafe-dark">No Products Found</h2>
            <p className="text-sm text-stone-600">
              {filters.search || filters.categoryId || filters.productType || filters.isAvailable !== ''
                ? 'No products match your current search/filter parameters.'
                : 'No products have been added yet.'}
            </p>
            {isAdmin && !filters.search && (
              <button
                onClick={handleOpenAdd}
                className="h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-sm shadow transition"
              >
                + Create First Product
              </button>
            )}
          </div>
        ) : (
          /* Product Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-coffee-brown text-white text-xs font-bold uppercase tracking-wider select-none">
                  <th className="py-3.5 px-4 text-center w-14">Icon</th>
                  <th className="py-3.5 px-6">Product & SKU</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-4 text-center">Type</th>
                  <th className="py-3.5 px-6 text-right">Price</th>
                  <th className="py-3.5 px-4 text-center">Available</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Order</th>
                  {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y border-stone-200 text-sm font-medium">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-amber-50/40 transition">
                    {/* Placeholder Icon */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl shrink-0 mx-auto">
                        {getPlaceholderIcon(product.product_type)}
                      </div>
                    </td>

                    {/* Name & SKU */}
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-cafe-dark">{product.name}</div>
                      <div className="text-xs font-mono text-stone-500 font-normal">
                        SKU: {product.sku}
                      </div>
                      {product.description && (
                        <div className="text-xs text-stone-400 truncate max-w-xs font-normal mt-0.5">
                          {product.description}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-6 text-stone-700 font-semibold">
                      {product.category_name || `Category #${product.category_id}`}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase tracking-wider ${getTypeBadge(
                          product.product_type
                        )}`}
                      >
                        {product.product_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-coffee-brown text-base">
                      ₹{parseFloat(product.price).toFixed(2)}
                    </td>

                    {/* Available Badge / Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleAvailability(product.id, product.is_available)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                            product.is_available
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                          }`}
                          title="Click to toggle billing availability"
                        >
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </button>
                      ) : (
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full border ${
                            product.is_available
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}
                        >
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      )}
                    </td>

                    {/* Active/Disabled Status */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          product.is_active
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : 'bg-stone-200 text-stone-600 border border-stone-300'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* Display Order */}
                    <td className="py-3.5 px-4 text-center font-mono text-stone-800">
                      {product.display_order}
                    </td>

                    {/* Actions (Admin Only) */}
                    {isAdmin && (
                      <td className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActiveStatus(product.id, product.is_active)}
                          className={`px-3.5 py-1.5 rounded-lg border font-semibold text-xs transition ${
                            product.is_active
                              ? 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800'
                              : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {product.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        isLoading={isLoading}
      />
    </div>
  );
}
