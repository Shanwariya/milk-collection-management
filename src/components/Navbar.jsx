import React from 'react';
import { Milk, Sun, Moon, LogOut, UserCheck, Settings, PlusCircle, BarChart3, Smartphone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode, rates } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              🥛
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Milkman Dairy
              </span>
              <span className="block text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                Collection System
              </span>
            </div>
          </Link>

          {/* Quick Rates Badge */}
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
              🐄 Cow: ₹{rates.cow_rate}/L
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
              🐃 Buffalo: ₹{rates.buffalo_rate}/L
            </span>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Collect Milk CTA (Only for Milkman) */}
            {(!user || user.role === 'milkman' || user.role === 'admin') && (
              <Link
                to="/collect"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Collect Milk</span>
              </Link>
            )}

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>

            {/* User Profile / Role Badge */}
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100">{user?.fullName}</div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  {user?.role}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
