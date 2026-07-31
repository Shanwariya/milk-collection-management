import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const QuantityPicker = ({ value, onChange }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Generate 0.25 increment values from 1.00 to 10.00
  const quantities = [];
  for (let q = 1.00; q <= 10.00; q += 0.25) {
    quantities.push(parseFloat(q.toFixed(2)));
  }

  const handleSelect = (qty) => {
    onChange(qty);
    setShowCustomInput(false);
  };

  const adjustQty = (delta) => {
    const nextVal = Math.max(0.25, Math.min(25.00, parseFloat((value + delta).toFixed(2))));
    onChange(nextVal);
  };

  return (
    <div className="space-y-4">
      {/* Current Selected Large Display Box */}
      <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
            Selected Quantity
          </span>
          <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
            {parseFloat(value).toFixed(2)}
            <span className="text-xl font-semibold text-slate-600 dark:text-slate-400">Liters</span>
          </div>
        </div>

        {/* Quick Fine-tune Increments */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => adjustQty(-0.25)}
            className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-800 dark:text-slate-200"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => adjustQty(0.25)}
            className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Add Buttons Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[-0.50, +0.25, +0.50, +1.00].map((inc) => (
          <button
            key={inc}
            type="button"
            onClick={() => adjustQty(inc)}
            className={`py-2 px-3 rounded-xl font-bold text-sm shadow-sm transition-all border ${
              inc > 0 
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-700/60 hover:bg-emerald-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            {inc > 0 ? `+${inc.toFixed(2)}L` : `${inc.toFixed(2)}L`}
          </button>
        ))}
      </div>

      {/* 0.25 Increment Touch Grid (1.00L to 10.00L) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
          <span>ONE-TAP QUANTITY SELECTION (0.25L Increments)</span>
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            {showCustomInput ? 'Hide Keypad' : 'Custom Keypad'}
          </button>
        </div>

        {showCustomInput ? (
          <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <input
              type="number"
              step="0.01"
              min="0.1"
              max="50.0"
              value={value}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className="w-full text-center text-2xl font-bold p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
              placeholder="Enter Liters..."
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto p-1 pr-2">
            {quantities.map((q) => {
              const isSelected = value === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSelect(q)}
                  className={`btn-touch min-h-[48px] text-sm sm:text-base transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 scale-105'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-500'
                  }`}
                >
                  {q.toFixed(2)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
