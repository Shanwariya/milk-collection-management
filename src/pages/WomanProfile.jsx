import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { EditCollectionModal } from '../components/EditCollectionModal';
import { 
  User, Phone, MapPin, PlusCircle, Edit3, Trash2, 
  Sun, Moon, Milk, Calendar, FileText, ArrowLeft, Download, UserX 
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '../services/exportUtils';

export const WomanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, collections, deleteCustomer } = useApp();
  const { isMilkman } = useAuth();

  const [editingRecord, setEditingRecord] = useState(null);

  const customerMatch = customers.find(c => 
    c.id.toLowerCase() === id?.toLowerCase() || 
    (c.username && c.username.toLowerCase() === id?.toLowerCase())
  );

  const customer = customerMatch || (isCustomer && user ? {
    id: user.customer_id || id,
    name: user.fullName || user.username,
    username: user.username,
    phone: '',
    address: ''
  } : null);

  const customerCollections = collections.filter(c => 
    customer && (
      c.customer_id.toLowerCase() === customer.id.toLowerCase() ||
      (c.customer_name && c.customer_name.toLowerCase() === customer.name.toLowerCase())
    )
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCols = customerCollections.filter(c => c.collection_date === todayStr);

  let mCow = 0, mBuf = 0, eCow = 0, eBuf = 0;
  todayCols.forEach(c => {
    if (c.shift === 'Morning') {
      if (c.milk_type === 'Cow') mCow += c.quantity;
      if (c.milk_type === 'Buffalo') mBuf += c.quantity;
    } else {
      if (c.milk_type === 'Cow') eCow += c.quantity;
      if (c.milk_type === 'Buffalo') eBuf += c.quantity;
    }
  });

  const todayCowTotal = mCow + eCow;
  const todayBufTotal = mBuf + eBuf;
  const todayGrandLiters = todayCowTotal + todayBufTotal;
  const todayTotalAmount = todayCols.reduce((acc, c) => acc + c.total_amount, 0);

  const overallCowLiters = customerCollections.filter(c => c.milk_type === 'Cow').reduce((acc, c) => acc + c.quantity, 0);
  const overallBufLiters = customerCollections.filter(c => c.milk_type === 'Buffalo').reduce((acc, c) => acc + c.quantity, 0);
  const overallAmount = customerCollections.reduce((acc, c) => acc + c.total_amount, 0);

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Woman Profile Not Found</h2>
        <p className="text-sm text-slate-500">Customer with ID {id} does not exist.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const handleExportPdf = () => {
    exportToPDF(customerCollections, `${customer.name} (${customer.id}) Milk Summary`, `${customer.id}_Report.pdf`);
  };

  const handleDeleteUser = async () => {
    if (window.confirm(`Are you sure you want to permanently remove woman user "${customer.name}" (${customer.id})?`)) {
      const res = await deleteCustomer(customer.id);
      if (res.success) {
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-8">
      
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-200"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          {isMilkman && (
            <>
              <button
                onClick={handleDeleteUser}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                title="Remove User"
              >
                <UserX className="w-4 h-4" />
                <span>Remove User</span>
              </button>

              <Link
                to={`/collect?customerId=${customer.id}`}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Collect Milk</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="card-glass p-6 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-2xl shadow-lg shadow-emerald-600/30">
            {customer.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">{customer.name}</h1>
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold px-2.5 py-0.5 rounded-lg text-xs border border-emerald-300/40">
                {customer.id}
              </span>
            </div>
            <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-3 mt-1">
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer.phone}
                </span>
              )}
              {customer.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {customer.address}
                </span>
              )}
            </div>
            {customer.notes && (
              <p className="text-xs text-slate-400 italic mt-1 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded inline-block">
                📝 {customer.notes}
              </p>
            )}
          </div>
        </div>

        {/* Overall Lifetime Stats */}
        <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Overall Supplied
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {(overallCowLiters + overallBufLiters).toFixed(2)} Liters
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Total Payout: ₹{overallAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Today's Collection Box */}
      <div className="card-glass p-5 border-emerald-500/40 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <span>📅</span>
            <span>Today's Collection ({todayStr})</span>
          </h2>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
            Total: {todayGrandLiters.toFixed(2)} L (₹{todayTotalAmount.toFixed(2)})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Morning Shift Breakdown */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase">
              <span className="flex items-center gap-1">
                <Sun className="w-4 h-4" /> Morning Shift
              </span>
              <span>{(mCow + mBuf).toFixed(2)} L</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <span className="text-slate-500 block text-[10px]">Cow Milk</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm">{mCow.toFixed(2)} L</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                <span className="text-slate-500 block text-[10px]">Buffalo Milk</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm">{mBuf.toFixed(2)} L</span>
              </div>
            </div>
          </div>

          {/* Evening Shift Breakdown */}
          <div className="p-4 bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold text-sky-700 dark:text-sky-400 uppercase">
              <span className="flex items-center gap-1">
                <Moon className="w-4 h-4" /> Evening Shift
              </span>
              <span>{(eCow + eBuf).toFixed(2)} L</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-sky-200 dark:border-sky-900/40">
                <span className="text-slate-500 block text-[10px]">Cow Milk</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm">{eCow.toFixed(2)} L</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-sky-200 dark:border-sky-900/40">
                <span className="text-slate-500 block text-[10px]">Buffalo Milk</span>
                <span className="text-slate-900 dark:text-slate-100 text-sm">{eBuf.toFixed(2)} L</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* History Table */}
      <div className="card-glass p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
            Milk Collection History
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {customerCollections.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Date & Time</th>
                <th className="p-3">Shift</th>
                <th className="p-3">Milk Type</th>
                <th className="p-3 text-right">Quantity (L)</th>
                <th className="p-3 text-right">Rate (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
                <th className="p-3 rounded-r-xl text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {customerCollections.map((col) => (
                <tr key={col.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-semibold">
                    <div className="text-slate-900 dark:text-slate-100 font-bold">{col.collection_date}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{col.collection_time}</div>
                  </td>
                  <td className="p-3 font-bold">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      col.shift === 'Morning' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                    }`}>
                      {col.shift === 'Morning' ? '🌅 Morning' : '🌙 Evening'}
                    </span>
                  </td>
                  <td className="p-3 font-bold">
                    {col.milk_type === 'Cow' ? '🐄 Cow' : '🐃 Buffalo'}
                  </td>
                  <td className="p-3 text-right font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    {col.quantity.toFixed(2)} L
                  </td>
                  <td className="p-3 text-right font-semibold">
                    ₹{col.rate}
                  </td>
                  <td className="p-3 text-right font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                    ₹{col.total_amount.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => setEditingRecord(col)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      <EditCollectionModal
        record={editingRecord}
        isOpen={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
      />

    </div>
  );
};
