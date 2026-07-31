import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SmartSearch } from '../components/SmartSearch';
import { QuantityPicker } from '../components/QuantityPicker';
import { Sun, Moon, Milk, CheckCircle2, UserCheck, Calendar, Clock, Calculator } from 'lucide-react';

export const MilkCollection = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customers, rates, saveCollection, refreshData } = useApp();
  const { isCustomer } = useAuth();

  useEffect(() => {
    refreshData();
    if (isCustomer) {
      navigate('/', { replace: true });
    }
  }, [isCustomer, navigate, refreshData]);

  const [selectedWoman, setSelectedWoman] = useState(null);
  const [shift, setShift] = useState(() => new Date().getHours() < 12 ? 'Morning' : 'Evening');
  const [milkType, setMilkType] = useState('Cow');
  const [quantity, setQuantity] = useState(2.00);
  const [submitting, setSubmitting] = useState(false);

  // Auto pick woman from query param if available
  useEffect(() => {
    const custId = searchParams.get('customerId');
    if (custId && customers.length > 0) {
      const match = customers.find(c => c.id.toLowerCase() === custId.toLowerCase());
      if (match) setSelectedWoman(match);
    }
  }, [searchParams, customers]);

  const currentRate = milkType === 'Cow' ? rates.cow_rate : rates.buffalo_rate;
  const totalAmount = (parseFloat(quantity || 0) * parseFloat(currentRate || 0)).toFixed(2);

  const todayDateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedWoman) {
      alert('Please select a woman farmer first!');
      return;
    }

    setSubmitting(true);
    const res = await saveCollection({
      customer_id: selectedWoman.id,
      customer_name: selectedWoman.name,
      shift,
      milk_type: milkType,
      quantity: parseFloat(quantity),
      collection_date: todayDateStr,
      collection_time: timeStr
    });
    setSubmitting(false);

    if (res.success) {
      // Navigate to woman's profile to see summary or stay for next collection
      navigate(`/woman/${selectedWoman.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 sm:pb-8">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>🥛</span> Collect Milk
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Fast, single-hand milk entry for farmers
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-500 flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{todayDateStr}</span>
            </div>
            <div className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Select Woman */}
      <div className="card-glass p-5 space-y-3">
        <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          Step 1: Select Woman / Farmer
        </label>
        
        {selectedWoman ? (
          <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                {selectedWoman.name.charAt(0)}
              </div>
              <div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                  {selectedWoman.name}
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <span className="bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                    {selectedWoman.id}
                  </span>
                  {selectedWoman.phone && <span>• {selectedWoman.phone}</span>}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedWoman(null)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 transition-colors"
            >
              Change
            </button>
          </div>
        ) : (
          <SmartSearch onSelectCustomer={(cust) => setSelectedWoman(cust)} />
        )}
      </div>

      {/* Step 2: Collection Details */}
      {selectedWoman && (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Shift & Milk Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Morning vs Evening Shift */}
            <div className="card-glass p-4 space-y-2">
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Shift Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('Morning')}
                  className={`btn-touch text-sm ${
                    shift === 'Morning'
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sun className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>Morning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShift('Evening')}
                  className={`btn-touch text-sm ${
                    shift === 'Evening'
                      ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 ring-2 ring-sky-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Moon className="w-4 h-4 mr-1.5 shrink-0" />
                  <span>Evening</span>
                </button>
              </div>
            </div>

            {/* Cow vs Buffalo Milk */}
            <div className="card-glass p-4 space-y-2">
              <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Milk Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMilkType('Cow')}
                  className={`btn-touch text-sm ${
                    milkType === 'Cow'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="mr-1">🐄</span>
                  <span>Cow (₹{rates.cow_rate})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMilkType('Buffalo')}
                  className={`btn-touch text-sm ${
                    milkType === 'Buffalo'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="mr-1">🐃</span>
                  <span>Buffalo (₹{rates.buffalo_rate})</span>
                </button>
              </div>
            </div>

          </div>

          {/* Step 3: Quantity Selector */}
          <div className="card-glass p-5 space-y-3">
            <label className="block text-xs font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Step 2: One-Tap Quantity Selection
            </label>
            <QuantityPicker value={quantity} onChange={(val) => setQuantity(val)} />
          </div>

          {/* Step 4: Real-time Rate Calculation Box */}
          <div className="card-glass p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-100">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4" />
                Real-Time Cost Calculation
              </span>
              <span>{milkType} Milk @ ₹{currentRate}/L</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-sm font-semibold opacity-90 block">Calculation Formula:</span>
                <span className="text-lg font-bold">
                  {quantity.toFixed(2)} Liters × ₹{currentRate}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold opacity-80 uppercase block">Total Amount</span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  ₹{totalAmount}
                </div>
              </div>
            </div>
          </div>

          {/* Save Collection CTA Button */}
          <button
            type="submit"
            disabled={submitting || quantity <= 0}
            className="w-full btn-touch min-h-[60px] bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>✅ Save Milk Collection</span>
          </button>

        </form>
      )}

    </div>
  );
};
