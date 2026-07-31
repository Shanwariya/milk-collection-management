import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SmartSearch } from '../components/SmartSearch';
import { 
  PlusCircle, Milk, BarChart3, FileSpreadsheet, Users, 
  TrendingUp, Sun, Moon, DollarSign, Award, ChevronRight, RefreshCw 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line 
} from 'recharts';
import { exportToExcel } from '../services/exportUtils';

export const Dashboard = () => {
  const { dashboardMetrics, collections, customers, refreshData, loading } = useApp();
  const { user, isCustomer } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    if (isCustomer && user?.customer_id) {
      navigate(`/woman/${user.customer_id}`, { replace: true });
    }
  }, [isCustomer, user, navigate, refreshData]);

  const handleExportExcel = () => {
    exportToExcel(collections, `MilkCollection_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const today = dashboardMetrics?.today || {
    totalCowLiters: 0,
    totalBufLiters: 0,
    totalLiters: 0,
    morning: { cow: 0, buffalo: 0 },
    evening: { cow: 0, buffalo: 0 },
    revenue: { cowAmount: 0, bufAmount: 0, totalAmount: 0 }
  };

  const weekly = dashboardMetrics?.weekly || { totalLiters: 0, chartData: [] };
  const monthly = dashboardMetrics?.monthly || { grandTotalLiters: 0, totalRevenue: 0, monthName: 'Current Month' };
  const counts = dashboardMetrics?.counts || { registeredWomen: customers.length || 0, totalEntries: collections.length || 0 };
  const charts = dashboardMetrics?.charts || { cowVsBuffaloPie: [], dailyCollection: [], top10Suppliers: [] };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      
      {/* Smart Search Bar Header */}
      <div className="card-glass p-4 border-emerald-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🥛</span> Milkman Dashboard
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              One-hand mobile milk collection & daily record tracking
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
        
        {/* Smart Search Dropdown Component */}
        <SmartSearch onSelectCustomer={(cust) => navigate(`/collect?customerId=${cust.id}`)} />
      </div>

      {/* Today's Milk Collection Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Today Liters */}
        <div className="card-glass p-4 relative overflow-hidden group border-emerald-500/40">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
            Today's Total Milk
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {today.totalLiters.toFixed(2)} <span className="text-base font-semibold text-slate-500">L</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="text-amber-600 dark:text-amber-400">🐄 {today.totalCowLiters.toFixed(2)}L</span>
            <span className="text-sky-600 dark:text-sky-400">🐃 {today.totalBufLiters.toFixed(2)}L</span>
          </div>
        </div>

        {/* Morning Shift */}
        <div className="card-glass p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              🌅 Morning Shift
            </span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {(today.morning.cow + today.morning.buffalo).toFixed(2)} <span className="text-base font-semibold text-slate-500">L</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Cow: {today.morning.cow}L</span>
            <span>Buffalo: {today.morning.buffalo}L</span>
          </div>
        </div>

        {/* Evening Shift */}
        <div className="card-glass p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              🌙 Evening Shift
            </span>
            <Moon className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {(today.evening.cow + today.evening.buffalo).toFixed(2)} <span className="text-base font-semibold text-slate-500">L</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>Cow: {today.evening.cow}L</span>
            <span>Buffalo: {today.evening.buffalo}L</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="card-glass p-4 relative overflow-hidden group border-teal-500/40 bg-gradient-to-br from-teal-500/5 to-emerald-500/10">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300 block mb-1">
            Today's Revenue
          </span>
          <div className="text-2xl sm:text-3xl font-black text-teal-600 dark:text-teal-400">
            ₹{today.revenue.totalAmount.toFixed(2)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span>Cow: ₹{today.revenue.cowAmount}</span>
            <span>Buf: ₹{today.revenue.bufAmount}</span>
          </div>
        </div>

      </div>

      {/* Quick Buttons Bar */}
      <div className="card-glass p-4">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Quick Operations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <Link
            to="/collect"
            className="p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20 flex items-center gap-3 active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white">
              <Milk className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-extrabold text-sm">🥛 Collect Milk</div>
              <div className="text-[11px] text-emerald-100">One-Tap Entry</div>
            </div>
          </Link>

          <Link
            to="/reports"
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">📊 Reports</div>
              <div className="text-[11px] text-slate-500">Daily / Monthly</div>
            </div>
          </Link>

          <button
            onClick={handleExportExcel}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 flex items-center gap-3 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">📁 Export Excel</div>
              <div className="text-[11px] text-slate-500">Download .xlsx</div>
            </div>
          </button>

        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="card-glass p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Weekly Collection</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {weekly.totalLiters.toFixed(2)} Liters
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="card-glass p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Monthly Collection</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {monthly.grandTotalLiters.toFixed(2)} Liters
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Revenue: ₹{monthly.totalRevenue.toFixed(2)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="card-glass p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Registered Women</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {counts.registeredWomen} Women
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Total Entries: {counts.totalEntries}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Bar Chart: Daily Collection (Past 7 Days) */}
        <div className="card-glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <span>Daily Collection (Past 7 Days)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">Liters</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.dailyCollection} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Cow" fill="#eab308" radius={[4, 4, 0, 0]} name="Cow Milk (L)" />
                <Bar dataKey="Buffalo" fill="#0284c7" radius={[4, 4, 0, 0]} name="Buffalo Milk (L)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Pie Chart: Cow vs Buffalo Distribution */}
        <div className="card-glass p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <span>🐄</span>
              <span>Cow vs Buffalo Milk Distribution</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">Overall Ratio</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.cowVsBuffaloPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {charts.cowVsBuffaloPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: '#334155', 
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Top 10 Women Suppliers Leaderboard */}
        <div className="card-glass p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Top 10 Women Suppliers (Highest Milk Volume)</span>
            </h3>
            <Link to="/reports" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              View All →
            </Link>
          </div>

          {charts.top10Suppliers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {charts.top10Suppliers.slice(0, 10).map((sup, idx) => (
                <div 
                  key={sup.id}
                  onClick={() => navigate(`/woman/${sup.id}`)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl font-extrabold flex items-center justify-center text-xs ${
                      idx === 0 ? 'bg-amber-400 text-amber-950 shadow-sm' :
                      idx === 1 ? 'bg-slate-300 text-slate-900' :
                      idx === 2 ? 'bg-amber-700 text-amber-100' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{sup.name}</div>
                      <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{sup.id}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {sup.totalLiters.toFixed(2)} L
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      ₹{sup.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 text-xs sm:text-sm font-semibold space-y-1">
              <p>No milk collection data available.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
