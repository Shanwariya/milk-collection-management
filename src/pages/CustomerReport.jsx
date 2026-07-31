import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SmartSearch } from '../components/SmartSearch';
import { exportToExcel, exportToPDF } from '../services/exportUtils';
import { User, Calendar, FileSpreadsheet, Download, Filter } from 'lucide-react';

export const CustomerReport = () => {
  const { customers, collections } = useApp();
  const { user, isCustomer } = useAuth();

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    if (customers.length > 0) {
      if (isCustomer && user?.customer_id) {
        const found = customers.find(c => c.id.toLowerCase() === user.customer_id.toLowerCase() || (c.username && c.username.toLowerCase() === user.username.toLowerCase()));
        if (found) {
          setSelectedCustomer(found);
          return;
        }
      }
      if (!selectedCustomer) {
        setSelectedCustomer(customers[0]);
      }
    }
  }, [customers, isCustomer, user]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  let filtered = collections;
  if (selectedCustomer) {
    filtered = filtered.filter(c => c.customer_id.toLowerCase() === selectedCustomer.id.toLowerCase());
  }
  if (startDate) {
    filtered = filtered.filter(c => c.collection_date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(c => c.collection_date <= endDate);
  }

  let mCow = 0, mBuf = 0, eCow = 0, eBuf = 0;
  let cowTotalL = 0, bufTotalL = 0;

  filtered.forEach(c => {
    if (c.shift === 'Morning') {
      if (c.milk_type === 'Cow') mCow += c.quantity;
      else mBuf += c.quantity;
    } else {
      if (c.milk_type === 'Cow') eCow += c.quantity;
      else eBuf += c.quantity;
    }

    if (c.milk_type === 'Cow') cowTotalL += c.quantity;
    else bufTotalL += c.quantity;
  });

  const grandTotalLiters = cowTotalL + bufTotalL;
  const totalAmount = filtered.reduce((a, c) => a + c.total_amount, 0);

  const handleExportExcel = () => {
    exportToExcel(filtered, `CustomerReport_${selectedCustomer ? selectedCustomer.id : 'All'}.xlsx`);
  };

  const handleExportPdf = () => {
    exportToPDF(filtered, `Customer Report - ${selectedCustomer ? selectedCustomer.name : 'All Farmers'}`, `CustomerReport.pdf`);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="w-6 h-6 text-emerald-500" />
            <span>Customer-Wise Milk Report</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Filter milk supply records by woman & date range
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

      {/* Filter Section */}
      <div className="card-glass p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Customer Typeahead */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Woman / Farmer
            </label>
            {!isCustomer ? (
              <SmartSearch
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                placeholder="Search Username, Name or ID..."
              />
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl font-extrabold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{selectedCustomer?.name || user?.fullName}</span>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

        </div>

        {selectedCustomer && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">
              Selected: {selectedCustomer.name} ({selectedCustomer.id})
            </span>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="font-extrabold text-rose-500 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="card-glass p-3 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Morning Cow</span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400">{mCow.toFixed(2)} L</span>
        </div>
        <div className="card-glass p-3 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Morning Buf</span>
          <span className="text-base font-black text-sky-600 dark:text-sky-400">{mBuf.toFixed(2)} L</span>
        </div>
        <div className="card-glass p-3 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Evening Cow</span>
          <span className="text-base font-black text-amber-600 dark:text-amber-400">{eCow.toFixed(2)} L</span>
        </div>
        <div className="card-glass p-3 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Evening Buf</span>
          <span className="text-base font-black text-sky-600 dark:text-sky-400">{eBuf.toFixed(2)} L</span>
        </div>
        <div className="card-glass p-3 text-center bg-emerald-500/10 border-emerald-500/30">
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block">Grand Total</span>
          <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{grandTotalLiters.toFixed(2)} L</span>
        </div>
        <div className="card-glass p-3 text-center bg-teal-500/10 border-teal-500/30">
          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase block">Total Payout</span>
          <span className="text-base font-black text-teal-600 dark:text-teal-400">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Itemized Table */}
      <div className="card-glass p-5 space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
          Itemized Milk Collection List ({filtered.length} Entries)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-xl">ID & Name</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Shift</th>
                <th className="p-3.5">Milk Type</th>
                <th className="p-3.5 text-right">Quantity (L)</th>
                <th className="p-3.5 text-right">Rate (₹)</th>
                <th className="p-3.5 rounded-r-xl text-right font-black">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold">
                    <div className="text-slate-900 dark:text-slate-100">{col.customer_name}</div>
                    <div className="text-[10px] font-mono text-emerald-600">{col.customer_id}</div>
                  </td>
                  <td className="p-3.5 font-semibold">
                    <div>{col.collection_date}</div>
                    <div className="text-[10px] text-slate-400">{col.collection_time}</div>
                  </td>
                  <td className="p-3.5 font-bold">
                    {col.shift === 'Morning' ? '🌅 Morning' : '🌙 Evening'}
                  </td>
                  <td className="p-3.5 font-bold">
                    {col.milk_type === 'Cow' ? '🐄 Cow' : '🐃 Buffalo'}
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {col.quantity.toFixed(2)} L
                  </td>
                  <td className="p-3.5 text-right font-semibold">₹{col.rate}</td>
                  <td className="p-3.5 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{col.total_amount.toFixed(2)}
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
