import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EditCollectionModal = ({ record, isOpen, onClose }) => {
  const { updateCollection, deleteCollection } = useApp();
  
  const [shift, setShift] = useState('Morning');
  const [milkType, setMilkType] = useState('Cow');
  const [quantity, setQuantity] = useState(1.0);
  const [rate, setRate] = useState(20);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setShift(record.shift || 'Morning');
      setMilkType(record.milk_type || 'Cow');
      setQuantity(record.quantity || 1.0);
      setRate(record.rate || (record.milk_type === 'Buffalo' ? 30 : 20));
      setIsDeleting(false);
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const totalAmount = (parseFloat(quantity || 0) * parseFloat(rate || 0)).toFixed(2);

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await updateCollection(record.id, {
      shift,
      milk_type: milkType,
      quantity: parseFloat(quantity),
      rate: parseFloat(rate)
    });
    setSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    setSubmitting(true);
    await deleteCollection(record.id);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
              {isDeleting ? 'Delete Collection Record' : 'Edit Milk Record'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {record.customer_name} ({record.customer_id}) • {record.collection_date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isDeleting ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-800 dark:text-rose-200 space-y-1">
                <p className="font-bold text-sm">Are you sure you want to delete this entry?</p>
                <p>
                  Record: <strong>{record.quantity}L {record.milk_type} ({record.shift})</strong> on {record.collection_date}.
                  This action will be audited in history.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Shift Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Shift
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['Morning', 'Evening'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShift(s)}
                    className={`py-2.5 font-bold text-sm rounded-xl border transition-all ${
                      shift === s
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {s === 'Morning' ? '🌅 Morning' : '🌙 Evening'}
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Type */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Milk Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'Cow', label: '🐄 Cow Milk' },
                  { key: 'Buffalo', label: '🐃 Buffalo Milk' }
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setMilkType(type.key)}
                    className={`py-2.5 font-bold text-sm rounded-xl border transition-all ${
                      milkType === type.key
                        ? type.key === 'Cow'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20'
                          : 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Quantity (Liters)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-3 text-lg font-extrabold bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            {/* Price Preview */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-sm">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Updated Total:</span>
              <span className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400">₹{totalAmount}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleting(true)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
