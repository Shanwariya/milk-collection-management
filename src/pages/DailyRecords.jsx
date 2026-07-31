import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToExcel, exportToPDF } from '../services/exportUtils';
import { Calendar, Download, Search, FileSpreadsheet } from 'lucide-react';

export const DailyRecords = () => {
  const { collections } = useApp();
  const [searchDate, setSearchDate] = useState('');

  // Group collections by date
  const dateMap = {};
  collections.forEach(c => {
    const d = c.collection_date;
    if (!dateMap[d]) {
      dateMap[d] = {
        date: d,
        mCow: 0,
        mBuf: 0,
        eCow: 0,
        eBuf: 0,
        totalLiters: 0,
        totalAmount: 0
      };
    }
    const row = dateMap[d];
    if (c.shift === 'Morning') {
      if (c.milk_type === 'Cow') row.mCow += c.quantity;
      else row.mBuf += c.quantity;
    } else {
      if (c.milk_type === 'Cow') row.eCow += c.quantity;
      else row.eBuf += c.quantity;
    }
    row.totalLiters += c.quantity;
    row.totalAmount += c.total_amount;
  });

  let dailySummaryList = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

  if (searchDate) {
    dailySummaryList = dailySummaryList.filter(d => d.date.includes(searchDate));
  }

  const grandLiters = dailySummaryList.reduce((a, c) => a + c.totalLiters, 0);
  const grandAmount = dailySummaryList.reduce((a, c) => a + c.totalAmount, 0);

  const handleExportExcel = () => {
    const formatted = dailySummaryList.map(d => ({
      'Date': d.date,
      'Morning Cow (L)': d.mCow.toFixed(2),
      'Morning Buffalo (L)': d.mBuf.toFixed(2),
      'Evening Cow (L)': d.eCow.toFixed(2),
      'Evening Buffalo (L)': d.eBuf.toFixed(2),
      'Total Liters (L)': d.totalLiters.toFixed(2),
      'Total Amount (₹)': d.totalAmount.toFixed(2)
    }));
    exportToExcel(formatted, `DailyMilkRecords_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>📅</span> Daily Milk Records
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Day-wise morning & evening milk collection summary
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Date Filter & Search */}
      <div className="card-glass p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {searchDate && (
          <button
            onClick={() => setSearchDate('')}
            className="text-xs font-bold text-rose-500 hover:underline"
          >
            Clear Date Filter
          </button>
        )}

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-emerald-600 dark:text-emerald-400">{dailySummaryList.length}</span> Days
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-glass p-4 border-emerald-500/20">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Grand Total Liters</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {grandLiters.toFixed(2)} L
          </div>
        </div>

        <div className="card-glass p-4 border-emerald-500/20">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Grand Total Amount</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            ₹{grandAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Daily Records Table */}
      <div className="card-glass p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">Date</th>
                <th className="p-3.5 text-right">Morning Cow (L)</th>
                <th className="p-3.5 text-right">Morning Buffalo (L)</th>
                <th className="p-3.5 text-right">Evening Cow (L)</th>
                <th className="p-3.5 text-right">Evening Buffalo (L)</th>
                <th className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">Total Liters</th>
                <th className="p-3.5 rounded-r-xl text-right font-black">Total Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {dailySummaryList.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                    {row.date}
                  </td>
                  <td className="p-3.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {row.mCow.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-semibold text-sky-600 dark:text-sky-400">
                    {row.mBuf.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {row.eCow.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-semibold text-sky-600 dark:text-sky-400">
                    {row.eBuf.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    {row.totalLiters.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    ₹{row.totalAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
