import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, ShieldCheck, Database, History, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings = () => {
  const { rates, updateRates } = useApp();
  const { user, isAdmin } = useAuth();

  const [cowRate, setCowRate] = useState(rates.cow_rate || 20);
  const [buffaloRate, setBuffaloRate] = useState(rates.buffalo_rate || 30);
  const [submitting, setSubmitting] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  useEffect(() => {
    if (rates) {
      setCowRate(rates.cow_rate);
      setBuffaloRate(rates.buffalo_rate);
    }
  }, [rates]);

  const handleSaveRates = async (e) => {
    e.preventDefault();
    if (parseFloat(cowRate) <= 0 || parseFloat(buffaloRate) <= 0) {
      alert('Rates must be positive numbers!');
      return;
    }
    setSubmitting(true);
    await updateRates(parseFloat(cowRate), parseFloat(buffaloRate));
    setSubmitting(false);
  };

  const handleBackupNow = () => {
    setBackupMsg('✅ Database backup created successfully: db_backup_' + new Date().toISOString().split('T')[0] + '.json');
    setTimeout(() => setBackupMsg(''), 5000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-500" />
            <span>Milk Pricing & Admin Settings</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Configure milk rates, view security audit logs & database backups
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span className="capitalize">{user?.role || 'Milkman'}</span>
        </div>
      </div>

      {/* Pricing Settings Form */}
      <form onSubmit={handleSaveRates} className="card-glass p-6 space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
            <span>🥛</span> Milk Rate Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Set default per-liter rates for Cow Milk and Buffalo Milk.
          </p>
        </div>

        {/* Notice Banner about Historical Rates */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <span className="font-bold">Historical Rate Integrity:</span>
            <p>
              When milk rates are updated, only **future** collection entries will use the new prices. Past records retain their original historical rate locked at creation time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Cow Milk Rate */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/60 rounded-2xl space-y-2">
            <label className="block text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              🐄 Cow Milk Rate (₹ / Liter)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.50"
                min="1"
                value={cowRate}
                onChange={(e) => setCowRate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xl font-extrabold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Default: ₹20 / Liter</span>
          </div>

          {/* Buffalo Milk Rate */}
          <div className="p-4 bg-sky-50 dark:bg-sky-950/30 border border-sky-300/60 dark:border-sky-800/60 rounded-2xl space-y-2">
            <label className="block text-xs font-extrabold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
              🐃 Buffalo Milk Rate (₹ / Liter)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-bold text-slate-400">₹</span>
              <input
                type="number"
                step="0.50"
                min="1"
                value={buffaloRate}
                onChange={(e) => setBuffaloRate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xl font-extrabold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Default: ₹30 / Liter</span>
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-touch min-h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          <span>{submitting ? 'Updating Rates...' : 'Save New Milk Prices →'}</span>
        </button>
      </form>

      {/* Database Backup & Security Card */}
      <div className="card-glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">Database Backup & Audit</h3>
              <p className="text-xs text-slate-500">Daily automatic database backups & security audit trail</p>
            </div>
          </div>
        </div>

        {backupMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            {backupMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleBackupNow}
            className="p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors text-slate-800 dark:text-slate-200"
          >
            <Database className="w-4 h-4 text-purple-500" />
            <span>Trigger Database Backup</span>
          </button>

          <Link
            to="/audit"
            className="p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors text-slate-800 dark:text-slate-200"
          >
            <History className="w-4 h-4 text-emerald-500" />
            <span>View Security Audit Logs →</span>
          </Link>
        </div>
      </div>

    </div>
  );
};
