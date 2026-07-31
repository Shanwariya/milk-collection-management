import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { DailyRateModal } from './components/DailyRateModal';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MilkCollection } from './pages/MilkCollection';
import { WomanRegistration } from './pages/WomanRegistration';
import { WomanProfile } from './pages/WomanProfile';
import { DailyRecords } from './pages/DailyRecords';
import { MonthlyReport } from './pages/MonthlyReport';
import { CustomerReport } from './pages/CustomerReport';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { AuditLogs } from './pages/AuditLogs';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Notification Container */}
      <Toast />

      {/* Daily Rate Prompt Modal */}
      {!isLoginPage && user && <DailyRateModal />}

      {/* Top Navbar (Only when logged in) */}
      {!isLoginPage && user && <Navbar />}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/collect" element={<ProtectedRoute><MilkCollection /></ProtectedRoute>} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/woman/:id" element={<ProtectedRoute><WomanProfile /></ProtectedRoute>} />
          <Route path="/records" element={<ProtectedRoute><DailyRecords /></ProtectedRoute>} />
          <Route path="/monthly" element={<ProtectedRoute><MonthlyReport /></ProtectedRoute>} />
          <Route path="/customer-report" element={<ProtectedRoute><CustomerReport /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/audit" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isLoginPage && user && <BottomNav />}

    </div>
  );
}
