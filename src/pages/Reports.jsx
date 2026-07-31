import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel, exportToPDF, exportToCSV } from '../services/exportUtils';
import { sendWeeklyWhatsAppReport } from '../services/whatsappService';
import { BarChart3, FileSpreadsheet, Download, Send, Calendar, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Reports = () => {
  const { collections } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const past7DaysStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  const [whatsappStartDate, setWhatsappStartDate] = useState(past7DaysStr);
  const [whatsappEndDate, setWhatsappEndDate] = useState(todayStr);
  const [whatsappPhone, setWhatsappPhone] = useState('');

  const handleWeeklyWhatsApp = () => {
    sendWeeklyWhatsAppReport(collections, whatsappStartDate, whatsappEndDate, whatsappPhone);
  };

  const handleFullExport = (format) => {
    const filename = `MilkCollection_Full_${todayStr}.${format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx'}`;
    if (format === 'excel') exportToExcel(collections, filename);
    else if (format === 'pdf') exportToPDF(collections, 'Full Milk Collection Master Report', filename);
    else if (format === 'csv') exportToCSV(collections, filename);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-500" />
            <span>Reports & Exports Hub</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Download daily/monthly reports & automate weekly WhatsApp summaries
          </p>
        </div>
      </div>

      {/* Weekly WhatsApp Report Automation Box */}
      <div className="card-glass p-6 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-600/30">
              💬
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
                Weekly WhatsApp Report Automation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automatically generate weekly Excel report and launch WhatsApp with summary message
              </p>
            </div>
          </div>
          <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] px-3 py-1 rounded-xl">
            Automated Feature
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Week Start Date</label>
            <input
              type="date"
              value={whatsappStartDate}
              onChange={(e) => setWhatsappStartDate(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Week End Date</label>
            <input
              type="date"
              value={whatsappEndDate}
              onChange={(e) => setWhatsappEndDate(e.target.value)}
              className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 919876543210"
                className="w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWeeklyWhatsApp}
          className="w-full btn-touch min-h-[52px] bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          <span>Generate Weekly Excel & Send WhatsApp Summary →</span>
        </button>
      </div>

      {/* Quick Navigation Cards for Specific Reports */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <Link
          to="/records"
          className="card-glass p-5 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xl">📅</span>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base mt-2">Daily Records</div>
            <div className="text-xs text-slate-500">Day-wise collection breakdown</div>
          </div>
          <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link
          to="/monthly"
          className="card-glass p-5 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xl">📊</span>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base mt-2">Monthly Report</div>
            <div className="text-xs text-slate-500">Monthly trends & revenue</div>
          </div>
          <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

        <Link
          to="/customer-report"
          className="card-glass p-5 hover:border-emerald-500 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-xl">👩</span>
            <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base mt-2">Customer Report</div>
            <div className="text-xs text-slate-500">Woman-wise supply totals</div>
          </div>
          <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">→</span>
        </Link>

      </div>

      {/* Direct Export Formats */}
      <div className="card-glass p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
          Download Complete Database Export
        </h3>
        <p className="text-xs text-slate-500">
          Export all recorded milk collection entries in your preferred file format:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleFullExport('excel')}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-700/60 flex items-center gap-3 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors text-left"
          >
            <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Excel (.xlsx)</div>
              <div className="text-xs text-slate-500">Formatted spreadsheet with totals</div>
            </div>
          </button>

          <button
            onClick={() => handleFullExport('pdf')}
            className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300/60 dark:border-rose-700/60 flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-left"
          >
            <Download className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">PDF Document (.pdf)</div>
              <div className="text-xs text-slate-500">Printable summary document</div>
            </div>
          </button>

          <button
            onClick={() => handleFullExport('csv')}
            className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-300/60 dark:border-sky-700/60 flex items-center gap-3 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors text-left"
          >
            <FileSpreadsheet className="w-8 h-8 text-sky-600 dark:text-sky-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">CSV File (.csv)</div>
              <div className="text-xs text-slate-500">Raw comma-separated data</div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};
