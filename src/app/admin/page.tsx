"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

// 🔒 SECURITY: Only these emails can access the admin panel
// REPLACE THESE WITH YOUR ACTUAL GMAIL ADDRESSES
const ALLOWED_EMAILS = [
  "pradeepkaravadi@gmail.com", 
  
];

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Match Data State
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  const [whiteReal, setWhiteReal] = useState('');
  const [blackReal, setBlackReal] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // 1. Check Login Status on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAccess(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAccess(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Check if Email is Allowed
  const checkAccess = (session: any) => {
    if (session?.user?.email) {
      if (ALLOWED_EMAILS.includes(session.user.email)) {
        setAccessDenied(false);
        fetchAllMatches(); // Only fetch data if authorized
      } else {
        setAccessDenied(true);
      }
    }
  };

  const handleLogin = async () => {
    // This triggers the Google Pop-up
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin' }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMatches([]); // Clear sensitive data
  };

  // --- EXISTING ADMIN FUNCTIONS ---
  
  const fetchAllMatches = async () => {
    let { data } = await supabase.from('live_matches').select('*').order('created_at', { ascending: false });
    if (data) setMatches(data);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('live_matches').update({ is_active: !currentStatus }).eq('id', id);
    fetchAllMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete?")) return;
    await supabase.from('live_matches').delete().eq('id', id);
    fetchAllMatches();
  };

  const handlePublish = async () => {
    // Note: No password check needed anymore, the Google Login IS the security
    const finalWhiteName = whiteReal || whiteId;
    const finalBlackName = blackReal || blackId;

    const { error } = await supabase.from('live_matches').insert([{ 
        white_name: whiteId,           
        black_name: blackId,          
        white_display_name: finalWhiteName, 
        black_display_name: finalBlackName, 
        lichess_url: link, 
        is_active: true 
    }]);

    if (!error) { 
        setWhiteId(''); setBlackId(''); setWhiteReal(''); setBlackReal(''); setLink(''); 
        fetchAllMatches(); 
    } else {
        alert("Error saving match");
    }
  };

  const fetchLichessData = async () => {
    if (!link.includes('lichess.org/')) return alert('Invalid Link');
    const gameId = link.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    setLoading(true);
    try {
      const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
      const text = await res.text();
      setWhiteId(text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown");
      setBlackId(text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown");
    } catch (e) { alert("Error fetching data"); }
    setLoading(false);
  };

  // --- RENDER ---

  // State 1: Not Logged In
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6">🔒 Admin Access</h1>
          <p className="text-slate-400 mb-8">This area is restricted to tournament organizers only.</p>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
            Sign in with Google
          </button>
          <a href="/" className="block mt-6 text-slate-500 hover:text-white text-sm">← Back to Home</a>
        </div>
      </div>
    );
  }

  // State 2: Logged In but Unauthorized
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl border border-red-500/50 text-center max-w-md w-full">
          <div className="text-5xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-slate-300 mb-6">
            The email <strong>{session.user.email}</strong> is not on the admin whitelist.
          </p>
          <button onClick={handleLogout} className="bg-slate-700 px-6 py-2 rounded text-white">Logout</button>
        </div>
      </div>
    );
  }

  // State 3: Authorized Admin (The Dashboard)
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-amber-500">Admin Control</h1>
           <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-700">
             {session.user.email}
           </span>
        </div>
        <div className="flex gap-4">
            <a href="/" className="text-slate-400 hover:text-white py-2">Go Home</a>
            <button onClick={handleLogout} className="bg-slate-800 border border-slate-600 px-4 py-2 rounded hover:bg-slate-700 transition">
              Logout
            </button>
        </div>
      </header>

      {/* ... REST OF DASHBOARD ... */}
      <div className="max-w-5xl mx-auto grid gap-8">
        
        {/* ADD FORM */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
           <h2 className="text-lg font-bold mb-4 text-slate-300">New Match Entry</h2>
           
           <div className="flex gap-2 mb-6">
             <input className="flex-1 bg-slate-950 p-3 rounded border border-slate-600 focus:border-amber-500 outline-none" placeholder="Paste Lichess Link" value={link} onChange={e => setLink(e.target.value)} />
             <button onClick={fetchLichessData} disabled={loading} className="bg-blue-600 px-6 rounded font-bold hover:bg-blue-500 disabled:opacity-50">{loading ? '...' : 'Auto-Fill IDs'}</button>
           </div>

           <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">White Player</label>
                <input className="w-full bg-slate-950 p-3 rounded border border-slate-500 text-amber-400 font-bold" placeholder="Real Name" value={whiteReal} onChange={e => setWhiteReal(e.target.value)} />
                <input className="w-full bg-slate-900 p-2 rounded border border-slate-700 text-sm text-slate-400" placeholder="Lichess ID" value={whiteId} onChange={e => setWhiteId(e.target.value)} />
             </div>
             <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Black Player</label>
                <input className="w-full bg-slate-950 p-3 rounded border border-slate-500 text-amber-400 font-bold" placeholder="Real Name" value={blackReal} onChange={e => setBlackReal(e.target.value)} />
                <input className="w-full bg-slate-900 p-2 rounded border border-slate-700 text-sm text-slate-400" placeholder="Lichess ID" value={blackId} onChange={e => setBlackId(e.target.value)} />
             </div>
           </div>

           <button onClick={handlePublish} className="w-full bg-green-600 py-4 rounded font-bold hover:bg-green-500 text-lg shadow-lg">GO LIVE 🚀</button>
        </div>

        {/* LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-green-400 mb-4">🔴 Live Now</h2>
            <div className="space-y-3">
              {matches.filter(m => m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800 p-4 rounded border border-green-500/30 flex flex-col gap-2">
                  <div className="font-bold text-lg">{m.white_display_name} vs {m.black_display_name}</div>
                  <div className="text-xs text-slate-500">ID: {m.white_name} vs {m.black_name}</div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => toggleStatus(m.id, true)} className="flex-1 bg-slate-700 text-slate-300 py-1 rounded hover:bg-slate-600">⬇ Archive</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-900/50 text-red-400 px-3 rounded hover:bg-red-900">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-400 mb-4">📂 Archive</h2>
            <div className="space-y-3">
              {matches.filter(m => !m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800/50 p-4 rounded border border-slate-700 flex flex-col gap-2 opacity-75">
                  <div className="font-bold text-slate-400">{m.white_display_name} vs {m.black_display_name}</div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(m.id, false)} className="flex-1 bg-green-900/30 text-green-400 py-1 rounded hover:bg-green-900/50">⬆ Go Live</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-900/30 text-red-400 px-3 rounded hover:bg-red-900">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}