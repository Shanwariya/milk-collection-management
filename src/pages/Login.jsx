import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff, CheckCircle, UserPlus, Phone, MapPin, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await login(username.trim(), password.trim());
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid Username or Password');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await register({
      username: regUsername.trim().toLowerCase(),
      password: regPassword.trim(),
      name: regName.trim(),
      phone: regPhone.trim(),
      address: regAddress.trim()
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message || 'Registration successful!');
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  const setDemoUser = (userType) => {
    setMode('login');
    if (userType === 'milkman') {
      setUsername('milkman');
      setPassword('milk123');
    } else {
      setUsername('admin');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-500/20 mb-4 animate-bounce">
            <span className="text-4xl">🥛</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Milkman Dairy
          </h1>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            Milk Collection & Dairy Management System
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Sign In (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Woman Sign Up
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Username (Milkman or Woman Supplier)
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-950/60 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="Enter your username..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 bg-slate-950/60 border border-slate-700/80 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="Enter your password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all mt-2"
              >
                {loading ? 'Logging in...' : 'Sign In to Dashboard →'}
              </button>
            </form>
          ) : (
            /* WOMAN REGISTRATION FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name (Milk Provider Woman) *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="e.g. Lakshmi Devi"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Username *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="e.g. lakshmi123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Choose Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      placeholder="10-digit phone"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Village / Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      className="w-full pl-9 pr-2 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                      placeholder="Village/Location"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Registering...' : 'Complete Sign Up & Enter →'}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
              Milkman Quick Login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('milkman')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  username === 'milkman' 
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div>🥛 Milkman</div>
                  <div className="text-[10px] text-slate-400 font-normal">milkman / milk123</div>
                </div>
                {username === 'milkman' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('admin')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  username === 'admin' 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div>
                  <div>👑 Admin</div>
                  <div className="text-[10px] text-slate-400 font-normal">admin / admin123</div>
                </div>
                {username === 'admin' && <CheckCircle className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

