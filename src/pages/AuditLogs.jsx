import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { History, ShieldCheck, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.getAuditLogs();
    if (res.success) setLogs(res.auditLogs || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 pb-20 sm:pb-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="card-glass p-5 border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <History className="w-6 h-6 text-emerald-500" />
              <span>Audit Trail Logs</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold">
              Security log of all milk entry creations, updates, and deletions
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="card-glass p-5 space-y-4">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No audit logs recorded yet. All record modifications will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const actionBg = 
                log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                log.action === 'UPDATE' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';

              return (
                <div
                  key={log.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg font-black uppercase text-[10px] ${actionBg}`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Record ID #{log.collection_id}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span>Modified by user: <strong className="text-emerald-600 dark:text-emerald-400">{log.modified_by}</strong></span>
                  </div>

                  {log.old_data && (
                    <div className="p-2 bg-slate-200/50 dark:bg-slate-900/60 rounded-xl font-mono text-[11px] text-slate-600 dark:text-slate-400 overflow-x-auto">
                      <strong>Before:</strong> {log.old_data}
                    </div>
                  )}

                  {log.new_data && (
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl font-mono text-[11px] text-emerald-800 dark:text-emerald-300 overflow-x-auto">
                      <strong>After:</strong> {log.new_data}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
