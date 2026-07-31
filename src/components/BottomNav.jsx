import React from 'react';
import { LayoutDashboard, PlusCircle, Users, BarChart3, Settings, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const BottomNav = () => {
  const { user, isCustomer } = useAuth();

  const milkmanItems = [
    { to: '/', label: 'Home', icon: LayoutDashboard },
    { to: '/customer-report', label: 'Farmers', icon: Users },
    { to: '/collect', label: 'Collect', icon: PlusCircle, isPrimary: true },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const customerItems = [
    { to: user?.customer_id ? `/woman/${user.customer_id}` : '/', label: 'My Ledger', icon: User, isPrimary: true },
    { to: '/customer-report', label: 'My Report', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isCustomer ? customerItems : milkmanItems;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center -mt-6 p-3 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/40 active:scale-90 transition-all border-4 border-slate-50 dark:border-slate-950 ${
                    isActive ? 'ring-2 ring-emerald-400' : ''
                  }`
                }
              >
                <Icon className="w-6 h-6" />
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
