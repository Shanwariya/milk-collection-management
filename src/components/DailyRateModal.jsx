import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Sun, CheckCircle } from 'lucide-react';

export const DailyRateModal = () => {
  const { showRateModal, dismissRateModal, isMilkman } = useAuth();
  const { refreshData } = useApp();
  const [cowRate, setCowRate] = useState(20);
  const [buffaloRate, setBuffaloRate] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showRateModal) {
      api.getRates().then(res => {
        if (res.success && res.rates) {
          setCowRate(res.rates.cow_rate || 20);
          setBuffaloRate(res.rates.buffalo_rate || 30);

          // Check if rates were already updated today in PostgreSQL
          if (res.rates.updated_at) {
            const todayStr = new Date().toISOString().split('T')[0];
            let updatedDateStr = '';
            try {
              updatedDateStr = new Date(res.rates.updated_at).toISOString().split('T')[0];
            } catch (e) {
              updatedDateStr = String(res.rates.updated_at).split(' ')[0];
            }
            if (updatedDateStr === todayStr) {
              dismissRateModal();
            }
          }
        }
      });
    }
  }, [showRateModal, dismissRateModal]);

  if (!showRateModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (isMilkman) {
      await api.updateRates(parseFloat(cowRate), parseFloat(buffaloRate));
      if (refreshData) await refreshData();
    }
    setLoading(false);
    dismissRateModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 mb-2">
            <Sun className="w-9 h-9 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Good Morning! 🥛
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isMilkman 
              ? "Set & confirm today's morning milk prices per liter"
              : "Today's active milk prices per liter"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {/* Cow Milk Rate */}
            <div className="p-4 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                🐄 Cow Milk
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={cowRate}
                  onChange={(e) => setCowRate(e.target.value)}
                  readOnly={!isMilkman}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per liter</span>
            </div>

            {/* Buffalo Milk Rate */}
            <div className="p-4 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-2">
              <label className="block text-xs font-bold uppercase text-sky-600 dark:text-sky-400 tracking-wider">
                🦬 Buffalo Milk
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={buffaloRate}
                  onChange={(e) => setBuffaloRate(e.target.value)}
                  readOnly={!isMilkman}
                  className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">per liter</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            {loading ? "Updating..." : "Confirm & Continue →"}
          </button>
        </form>

      </div>
    </div>
  );
};
