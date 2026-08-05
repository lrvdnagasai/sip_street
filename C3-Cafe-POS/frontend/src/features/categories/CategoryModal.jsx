import React, { useState, useEffect } from 'react';

export default function CategoryModal({ isOpen, onClose, onSave, category = null, isLoading = false }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setDisplayOrder(category.display_order ?? 0);
    } else {
      setName('');
      setDescription('');
      setDisplayOrder(0);
    }
    setFormError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    if (name.trim().length > 50) {
      setFormError('Category name cannot exceed 50 characters.');
      return;
    }

    if (displayOrder < 0) {
      setFormError('Display order must be 0 or greater.');
      return;
    }

    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        display_order: Number(displayOrder),
      });
      onClose();
    } catch (err) {
      setFormError(err.message || 'Error saving category.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="bg-coffee-brown text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold tracking-wide">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-amber-200/80 hover:text-white font-bold text-xl leading-none transition"
          >
            &times;
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl p-3 flex items-start space-x-2">
              <span className="font-bold shrink-0">!</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Category Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tea, Coffee, Snacks"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Description <span className="text-stone-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of products in this category"
              className="w-full p-3 rounded-xl border border-stone-300 bg-stone-50/50 text-cafe-dark font-medium text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition resize-none"
            />
          </div>

          {/* Display Order Field */}
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
            <p className="text-[11px] text-stone-500">
              Lower numbers appear first in category tabs during billing.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
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
                <span>Save Category</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
