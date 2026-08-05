import React, { useState, useEffect } from 'react';
import useExpenseStore from '../../store/expenseStore';

const CATEGORIES = [
  { value: 'RAW_MATERIAL', label: 'Raw Material' },
  { value: 'MILK', label: 'Milk Dairy' },
  { value: 'COFFEE', label: 'Coffee Beans' },
  { value: 'VEGETABLES', label: 'Vegetables' },
  { value: 'PACKAGING', label: 'Packaging' },
  { value: 'SALARY', label: 'Staff Salary' },
  { value: 'ELECTRICITY', label: 'Electricity Bill' },
  { value: 'RENT', label: 'Store Rent' },
  { value: 'INTERNET', label: 'Internet / WiFi' },
  { value: 'MAINTENANCE', label: 'Maintenance & Repairs' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous' },
];

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI / QR' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
];

export default function ExpenseModal() {
  const { isModalOpen, editingExpense, isLoading, closeModal, saveExpense } = useExpenseStore();

  const [expenseDate, setExpenseDate] = useState('');
  const [category, setCategory] = useState('RAW_MATERIAL');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingExpense) {
      setExpenseDate(editingExpense.expense_date || '');
      setCategory(editingExpense.category || 'RAW_MATERIAL');
      setDescription(editingExpense.description || '');
      setAmount(editingExpense.amount ? editingExpense.amount.toString() : '');
      setPaymentMode(editingExpense.payment_mode || 'CASH');
      setReceiptNumber(editingExpense.receipt_number || '');
      setNotes(editingExpense.notes || '');
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setExpenseDate(todayStr);
      setCategory('RAW_MATERIAL');
      setDescription('');
      setAmount('');
      setPaymentMode('CASH');
      setReceiptNumber('');
      setNotes('');
    }
    setFormError('');
  }, [editingExpense, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError('Please enter a description for the expense.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than zero.');
      return;
    }

    try {
      await saveExpense({
        expense_date: expenseDate,
        category,
        description: description.trim(),
        amount: numAmount,
        payment_mode: paymentMode,
        receipt_number: receiptNumber.trim() || null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      // Error is handled in store
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-lg font-bold text-coffee-brown">
            {editingExpense ? 'Edit Operational Expense' : 'Record New Expense'}
          </h2>
          <button
            onClick={closeModal}
            className="text-stone-400 hover:text-stone-700 text-xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 mb-1 font-bold">Expense Date</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50 font-sans"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-bold">Description *</label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Fresh Whole Milk 10 Litres"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-600 mb-1 font-bold">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-stone-600 mb-1 font-bold">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50"
              >
                {PAYMENT_MODES.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-bold">Receipt / Invoice # (Optional)</label>
            <input
              type="text"
              maxLength={100}
              placeholder="e.g. MILK-INV-482"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50 font-mono"
            />
          </div>

          <div>
            <label className="block text-stone-600 mb-1 font-bold">Notes (Optional)</label>
            <textarea
              rows={2}
              maxLength={500}
              placeholder="Additional expense remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-300 text-stone-800 focus:outline-none focus:ring-2 focus:ring-coffee-brown/50 bg-stone-50 resize-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={closeModal}
              className="h-10 px-5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-10 px-6 rounded-xl bg-coffee-brown hover:bg-amber-900 active:scale-95 text-white font-bold transition disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
