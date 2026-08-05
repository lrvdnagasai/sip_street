import React, { useEffect, useState, useMemo } from 'react';
import useAuthStore from '../store/authStore';
import useCategoryStore from '../store/categoryStore';
import CategoryModal from '../features/categories/CategoryModal';

export default function CategoriesPage() {
  const { user } = useAuthStore();
  const {
    categories,
    isLoading,
    error,
    includeInactive,
    fetchCategories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
    setIncludeInactive,
    clearError,
  } = useCategoryStore();

  const isAdmin = user?.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories(includeInactive);
  }, [fetchCategories, includeInactive]);

  // Filter categories by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.trim().toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData) => {
    if (selectedCategory) {
      await updateCategory(selectedCategory.id, categoryData);
    } else {
      await createCategory(categoryData);
    }
  };

  const handleToggleStatus = async (category) => {
    await toggleCategoryStatus(category.id, category.is_active);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-coffee-brown">Category Management</h1>
          <p className="text-sm text-stone-600 mt-0.5">
            Manage product grouping categories used across billing and products.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold text-sm shadow transition flex items-center justify-center space-x-2 shrink-0"
          >
            <span className="text-lg font-bold">+</span>
            <span>Add Category</span>
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Instant Search Input */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            data-shortcut="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories... (Ctrl+F)"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-stone-300 bg-stone-50/60 text-cafe-dark text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-coffee-brown transition"
          />
          <span className="absolute left-3.5 top-2.5 text-stone-400 font-bold text-base select-none">
            🔍
          </span>
        </div>

        {/* Include Inactive Toggle (Admin Only) */}
        {isAdmin && (
          <label className="flex items-center space-x-2 text-sm font-medium text-stone-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="w-4 h-4 rounded border-stone-300 text-coffee-brown focus:ring-coffee-brown accent-coffee-brown"
            />
            <span>Show Disabled Categories</span>
          </label>
        )}
      </div>

      {/* Category List Table / Empty State */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {isLoading && categories.length === 0 ? (
          <div className="p-12 text-center text-stone-500 font-medium">
            <div className="w-6 h-6 border-2 border-coffee-brown border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100/70 text-coffee-brown mx-auto flex items-center justify-center text-3xl border border-amber-200">
              🏷️
            </div>
            <h2 className="text-xl font-bold text-cafe-dark">No Categories Found</h2>
            <p className="text-sm text-stone-600">
              {searchQuery
                ? `No categories matching "${searchQuery}". Try clearing your search filter.`
                : 'No product categories have been added yet.'}
            </p>
            {isAdmin && !searchQuery && (
              <button
                onClick={handleOpenAdd}
                className="h-12 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 text-white font-bold text-sm shadow transition"
              >
                + Create First Category
              </button>
            )}
          </div>
        ) : (
          /* Categories Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-coffee-brown text-white text-xs font-bold uppercase tracking-wider select-none">
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6 text-center">Display Order</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y border-stone-200 text-sm font-medium">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-amber-50/40 transition">
                    <td className="py-4 px-6 font-semibold text-cafe-dark">
                      {category.name}
                    </td>
                    <td className="py-4 px-6 text-stone-600 max-w-xs truncate">
                      {category.description || <span className="text-stone-400 italic">No description</span>}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-stone-800">
                      {category.display_order}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          category.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-200 text-stone-600 border border-stone-300'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(category)}
                          className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(category)}
                          className={`px-3.5 py-1.5 rounded-lg border font-semibold text-xs transition ${
                            category.is_active
                              ? 'border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800'
                              : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {category.is_active ? 'Disable' : 'Enable'}
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

      {/* Add / Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
        isLoading={isLoading}
      />
    </div>
  );
}
