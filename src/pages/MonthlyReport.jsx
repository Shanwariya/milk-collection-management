import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel, exportToPDF } from '../services/exportUtils';
import { Calendar, FileSpreadsheet, Download, TrendingUp } from 'lucide-react';

export const MonthlyReport = () => {
  const { collections } = useApp();
  
  const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const filteredCols = collections.filter(c => c.collection_date.startsWith(selectedMonth));

  // Daily totals map
  const dailyMap = {};
  filteredCols.forEach(c => {
    const d = c.collection_date;
    if (!dailyMap[d]) {
      dailyMap[d] = { date: d, cowL: 0, bufL: 0, totalLiters: 0, totalAmount: 0 };
    }
    if (c.milk_type === 'Cow') dailyMap[d].cowL += c.quantity;
    else dailyMap[d].bufL += c.quantity;

    dailyMap[d].totalLiters += c.quantity;
    dailyMap[d].totalAmount += c.total_amount;
  });

  const dailyRows = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  const totalCowLiters = filteredCols.filter(c => c.milk_type === 'Cow').reduce((a, c) => a + c.quantity, 0);
  const totalBufLiters = filteredCols.filter(c => c.milk_type === 'Buffalo').reduce((a, c) => a + c.quantity, 0);
  const grandTotalLiters = totalCowLiters + totalBufLiters;
  const totalRevenue = filteredCols.reduce((a, c) => a + c.total_amount, 0);

  const handleExportExcel = () => {
    const formatted = dailyRows.map(d => ({
      'Date': d.date,
      'Cow Milk (L)': d.cowL.toFixed(2),
      'Buffalo Milk (L)': d.bufL.toFixed(2),
      'Daily Total Liters (L)': d.totalLiters.toFixed(2),
      'Daily Revenue (₹)': d.totalAmount.toFixed(2)
    }));
    exportToExcel(formatted, `MonthlyMilkReport_${selectedMonth}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPDF(filteredCols, `Monthly Milk Collection Report (${selectedMonth})`, `MonthlyReport_${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <span>Monthly Milk Report</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Month-wise analytics, daily breakdown, and revenue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="card-glass p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-extrabold uppercase text-slate-500">Select Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing Month: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{selectedMonth}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="card-glass p-4 border-amber-500/30">
          <span className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400 block mb-1">
            Total Cow Milk
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalCowLiters.toFixed(2)} L
          </div>
        </div>

        <div className="card-glass p-4 border-sky-500/30">
          <span className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 block mb-1">
            Total Buffalo Milk
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalBufLiters.toFixed(2)} L
          </div>
        </div>

        <div className="card-glass p-4 border-emerald-500/40">
          <span className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">
            Grand Total Liters
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {grandTotalLiters.toFixed(2)} L
          </div>
        </div>

        <div className="card-glass p-4 border-teal-500/40 bg-teal-500/5">
          <span className="text-[11px] font-bold uppercase text-teal-700 dark:text-teal-300 block mb-1">
            Total Revenue
          </span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            ₹{totalRevenue.toFixed(2)}
          </div>
        </div>

      </div>

      {/* Daily Breakdown Table */}
      <div className="card-glass p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
          Daily Breakdown for {selectedMonth}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Date</th>
                <th className="p-3.5 text-right">Cow Milk (L)</th>
                <th className="p-3.5 text-right">Buffalo Milk (L)</th>
                <th className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">Daily Total (L)</th>
                <th className="p-3.5 rounded-r-xl text-right font-black">Daily Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailyRows.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{row.date}</td>
                  <td className="p-3.5 text-right font-semibold text-amber-600 dark:text-amber-400">{row.cowL.toFixed(2)} L</td>
                  <td className="p-3.5 text-right font-semibold text-sky-600 dark:text-sky-400">{row.bufL.toFixed(2)} L</td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">{row.totalLiters.toFixed(2)} L</td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-slate-900 dark:text-slate-100">₹{row.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
