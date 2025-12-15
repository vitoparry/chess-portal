"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

// 🔒 SUPER ADMIN CONFIG
const SUPER_ADMIN_EMAIL = "pradeepkaravadi@gmail.com"; 

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // 1. Verify Super Admin Status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === SUPER_ADMIN_EMAIL) {
        setIsSuperAdmin(true);
        fetchLogs();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchLogs = async () => {
    let { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Show last 100 actions
    if (data) setLogs(data);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-4">
        <div>
            <div className="text-5xl mb-4">⛔</div>
            <h1 className="text-2xl font-bold text-red-500">Super Admin Only</h1>
            <p className="text-slate-400 mt-2">This page is restricted to the owner.</p>
            <a href="/admin" className="block mt-6 text-blue-400 hover:text-white">← Back to Admin</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-red-500">🕵️ Super Admin Audit Log</h1>
        <a href="/admin" className="bg-slate-800 px-4 py-2 rounded text-slate-300 hover:text-white border border-slate-700">← Back to Dashboard</a>
      </header>

      <div className="max-w-6xl mx-auto bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                <th className="p-4">Time</th>
                <th className="p-4">Admin</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition">
                  <td className="p-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-blue-400">
                    {log.admin_email}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                      log.action_type === 'DELETE' ? 'bg-red-900/30 text-red-400 border-red-900' :
                      log.action_type === 'RESULT' ? 'bg-green-900/30 text-green-400 border-green-900' :
                      'bg-slate-700 text-slate-300 border-slate-600'
                    }`}>
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && <div className="p-8 text-center text-slate-500">No logs found yet.</div>}
      </div>
    </div>
  );
}