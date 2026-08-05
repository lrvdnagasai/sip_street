import React, { useState, useEffect } from 'react';

export default function ProductModal({
  isOpen,
  onClose,
  onSave,
  product = null,
  categories = [],
  isLoading = false,
}) {
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [sku, setSku] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [productType, setProductType] = useState('BEVERAGE');
  const [isAvailable, setIsAvailable] = useState(true);
  const [formError, setFormError] = useState('');

  // Filter active categories for dropdown
  const activeCategories = categories.filter((c) => c.is_active);

  useEffect(() => {
    if (product) {
      setCategoryId(product.category_id || '');
      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(product.price ? String(product.price) : '');
      setSku(product.sku || '');
      setDisplayOrder(product.display_order ?? 0);
      setProductType(product.product_type || 'BEVERAGE');
      setIsAvailable(product.is_available ?? true);
    } else {
      setCategoryId(activeCategories[0]?.id || '');
      setName('');
      setDescription('');
      setPrice('');
      setSku('');
      setDisplayOrder(0);
      setProductType('BEVERAGE');
      setIsAvailable(true);
    }
    setFormError('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!categoryId) {
      setFormError('Please select a category.');
      return;
    }

    if (!name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    if (name.trim().length > 80) {
      setFormError('Product name cannot exceed 80 characters.');
      return;
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }

    if (numPrice > 99999.99) {
      setFormError('Price cannot exceed 99,999.99.');
      return;
    }

    if (displayOrder < 0) {
      setFormError('Display order must be 0 or greater.');
      return;
    }

    try {
      await onSave({
        category_id: Number(categoryId),
        name: name.trim(),
        description: description.trim() || null,
        price: numPrice,
        sku: sku.trim() || null,
        display_order: Number(displayOrder),
        product_type: productType,
        is_available: isAvailable,
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Error saving product.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-coffee-brown text-white px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold tracking-wide">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-amber-200/80 hover:text-white font-bold text-xl leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3 flex items-start space-x-2">
              <span className="font-bold shrink-0">!</span>
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Field */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Category <span className="text-rose-600">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              >
                <option value="" disabled>Select Category</option>
                {activeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Name */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Product Name <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. South Indian Filter Coffee"
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              />
            </div>

            {/* Price Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Price (₹) <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="99999.99"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 50.00"
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              />
            </div>

            {/* SKU Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                SKU <span className="text-stone-400 font-normal">(Auto-generated if empty)</span>
              </label>
              <input
                type="text"
                maxLength={30}
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. COFFEE-001"
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-mono font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              />
            </div>

            {/* Product Type Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Product Type <span className="text-rose-600">*</span>
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              >
                <option value="BEVERAGE">☕ Beverage</option>
                <option value="VEG">🥗 Vegetarian</option>
                <option value="NON_VEG">🍗 Non-Vegetarian</option>
              </select>
            </div>

            {/* Display Order */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Description <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product ingredients or serving notes"
                className="w-full p-3 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition resize-none"
              />
            </div>

            {/* Availability Toggle */}
            <div className="sm:col-span-2 pt-1 flex items-center space-x-3">
              <input
                type="checkbox"
                id="isAvailableCheck"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-coffee-brown focus:ring-coffee-brown accent-coffee-brown"
              />
              <label htmlFor="isAvailableCheck" className="text-sm font-semibold text-stone-800 cursor-pointer">
                Available for Immediate Billing
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-12 px-5 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-sm shadow transition disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Product</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
