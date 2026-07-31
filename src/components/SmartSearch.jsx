import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const SmartSearch = ({ onSelectCustomer, placeholder = "Search Username, Woman Name or ID (e.g. lakshmi123, M0001)..." }) => {
  const { customers, refreshData } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Filter customers matching query
  const matches = query.trim() === '' ? [] : customers.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.id.toLowerCase().includes(query.toLowerCase()) ||
    (c.username && c.username.toLowerCase().includes(query.toLowerCase())) ||
    (c.phone && c.phone.includes(query))
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer) => {
    setIsOpen(false);
    setQuery(customer.name);
    if (onSelectCustomer) {
      onSelectCustomer(customer);
    } else {
      navigate(`/woman/${customer.id}`);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (refreshData) refreshData();
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-suggestions Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {matches.length > 0 ? (
            matches.map((cust) => (
              <button
                key={cust.id}
                onClick={() => handleSelect(cust)}
                className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300/40 dark:border-emerald-700/40">
                    {cust.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {cust.name}
                    </div>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        {cust.id}
                      </span>
                      {cust.username && (
                        <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                          @{cust.username}
                        </span>
                      )}
                      {cust.phone && <span>• {cust.phone}</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              No customer found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
