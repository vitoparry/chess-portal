"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  // --- STATE MANAGEMENT ---
  const [session, setSession] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Form Inputs
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  const [whiteReal, setWhiteReal] = useState('');
  const [blackReal, setBlackReal] = useState('');
  const [link, setLink] = useState('');
  const [startTime, setStartTime] = useState(''); // 📅 NEW: Start Time Input
  
  // System State
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // --- 1. AUTHENTICATION & SECURITY ---
  useEffect(() => {
    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAccess(session.user.email);
      else setCheckingAuth(false);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAccess(session.user.email);
      else setCheckingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Database Check: Is this email in the 'admins' table?
  const checkAccess = async (email: string | undefined) => {
    if (!email) return;
    setCheckingAuth(true);

    const { data } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .single();

    if (data) {
      setAccessDenied(false);
      fetchAllMatches();
    } else {
      setAccessDenied(true);
    }
    setCheckingAuth(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/admin' }
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMatches([]);
    setAccessDenied(false);
  };

  // --- 2. DATA FETCHING ---
  const fetchAllMatches = async () => {
    // Fetch Scheduled first (by time), then Live, then everything else
    let { data } = await supabase
        .from('live_matches')
        .select('*')
        .order('start_time', { ascending: true })
        .order('created_at', { ascending: false });
    if (data) setMatches(data);
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

  // --- 3. CORE ACTIONS ---
  
  // Start Edit Mode
  const startEdit = (match: any) => {
    setEditingId(match.id);
    setLink(match.lichess_url || ''); // Handle null links for scheduled games
    setWhiteId(match.white_name);
    setBlackId(match.black_name);
    setWhiteReal(match.white_display_name || '');
    setBlackReal(match.black_display_name || '');
    
    // Format the date for the input field (requires YYYY-MM-DDTHH:MM format)
    if (match.start_time) {
        const dt = new Date(match.start_time);
        // Adjust to local ISO string for input
        const localIso = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setStartTime(localIso);
    } else {
        setStartTime('');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Edit Mode
  const cancelEdit = () => {
    setEditingId(null);
    setLink('');
    setWhiteId(''); setBlackId('');
    setWhiteReal(''); setBlackReal('');
    setStartTime('');
  };

  // Publish (Create or Update)
  const handlePublish = async () => {
    const finalWhiteName = whiteReal || whiteId;
    const finalBlackName = blackReal || blackId;
    
    const matchData = {
        white_name: whiteId,
        black_name: blackId,
        white_display_name: finalWhiteName,
        black_display_name: finalBlackName,
        lichess_url: link, // Can be empty if scheduling
        start_time: startTime ? new Date(startTime).toISOString() : null,
        is_active: true,
        result: null // Reset result if we are re-publishing
    };

    if (editingId) {
        const { error } = await supabase.from('live_matches').update(matchData).eq('id', editingId);
        if (!error) { cancelEdit(); fetchAllMatches(); } else { alert("Error updating"); }
    } else {
        const { error } = await supabase.from('live_matches').insert([matchData]);
        if (!error) { cancelEdit(); fetchAllMatches(); } else { alert("Error creating"); }
    }
  };

  // 🏆 RECORD RESULT
  const recordResult = async (id: string, result: string) => {
    if(!confirm(`End match and record score: ${result}?`)) return;
    
    await supabase.from('live_matches').update({ 
        result: result, 
        is_active: false 
    }).eq('id', id);
    
    fetchAllMatches();
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('live_matches').update({ is_active: !currentStatus }).eq('id', id);
    fetchAllMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete?")) return;
    await supabase.from('live_matches').delete().eq('id', id);
    if (editingId === id) cancelEdit();
    fetchAllMatches();
  };

  // --- 4. RENDER VIEWS ---

  // Loading Screen
  if (checkingAuth && session) return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
  );

  // Not Logged In (Professional View)
  if (!session) return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-10 rounded-2xl shadow-2xl border border-slate-800 text-center max-w-md w-full">
          <div className="mb-6 bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-500 mb-8 text-sm">Authorized personnel only.</p>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-3 rounded-xl transition shadow-lg">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
            Sign in with Google
          </button>
          <a href="/" className="block mt-8 text-slate-600 hover:text-slate-400 text-xs uppercase tracking-widest font-bold transition">← Return to Tournament</a>
        </div>
      </div>
  );

  // Access Denied (Professional View)
  if (accessDenied) return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-8 rounded-2xl border border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.1)] text-center max-w-md w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-600"></div>
          <div className="mb-6 text-5xl">🚫</div>
          <h1 className="text-2xl font-bold text-red-500 mb-2">Authorization Failed</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">The account <strong>{session.user.email}</strong> is not listed in the <code>admins</code> database.</p>
          <div className="flex flex-col gap-3">
             <button onClick={handleLogout} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg border border-slate-700 transition font-medium">Sign out</button>
             <a href="/" className="text-slate-500 hover:text-white text-xs py-2 transition">Return to Home</a>
          </div>
        </div>
      </div>
  );

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-amber-500">Admin Control</h1>
           <span className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded-full border border-green-800 font-mono">
             {session.user.email}
           </span>
        </div>
        <div className="flex gap-4">
            <a href="/" className="text-slate-400 hover:text-white py-2 text-sm font-bold">View Site ↗</a>
            <button onClick={handleLogout} className="bg-slate-800 border border-slate-600 px-4 py-2 rounded hover:bg-slate-700 transition text-sm">Logout</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto grid gap-8">
        
        {/* INPUT FORM */}
        <div className={`p-6 rounded-xl border shadow-xl transition-all duration-300 ${editingId ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500/50' : 'bg-slate-800 border-slate-700'}`}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
               {editingId ? <span className="text-blue-400">✏️ Edit Mode</span> : <span>🚀 Schedule / New Match</span>}
             </h2>
             {editingId && (
               <button onClick={cancelEdit} className="text-xs bg-slate-900 px-3 py-1 rounded text-slate-400 hover:text-white border border-slate-700 transition">
                 Cancel
               </button>
             )}
           </div>
           
           <div className="flex gap-2 mb-6">
             <input className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-600 focus:border-amber-500 outline-none transition" placeholder="Lichess Link (Leave empty to Schedule)" value={link} onChange={e => setLink(e.target.value)} />
             <button onClick={fetchLichessData} disabled={loading} className="bg-blue-600 px-6 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50 transition shadow-lg text-sm tracking-wide">
               {loading ? '...' : 'AUTO-FILL'}
             </button>
           </div>

           {/* 📅 NEW: Date Picker */}
           <div className="mb-6">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Match Time (Optional)</label>
              <input 
                type="datetime-local" 
                className="w-full bg-slate-950 p-3 rounded-lg border border-slate-600 text-white scheme-dark focus:border-amber-500 outline-none"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-2 gap-6 mb-6">
             <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">White Player</label>
                <input className="w-full bg-slate-950 p-3 rounded-lg border border-slate-500 text-white font-bold focus:ring-1 focus:ring-white outline-none" placeholder="Real Name" value={whiteReal} onChange={e => setWhiteReal(e.target.value)} />
                <input className="w-full bg-slate-900/50 p-2 rounded border border-slate-800 text-xs text-slate-500 font-mono" placeholder="Lichess ID" value={whiteId} onChange={e => setWhiteId(e.target.value)} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Black Player</label>
                <input className="w-full bg-slate-950 p-3 rounded-lg border border-slate-500 text-white font-bold focus:ring-1 focus:ring-white outline-none" placeholder="Real Name" value={blackReal} onChange={e => setBlackReal(e.target.value)} />
                <input className="w-full bg-slate-900/50 p-2 rounded border border-slate-800 text-xs text-slate-500 font-mono" placeholder="Lichess ID" value={blackId} onChange={e => setBlackId(e.target.value)} />
             </div>
           </div>

           <button 
             onClick={handlePublish} 
             className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition transform active:scale-[0.98] ${editingId ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20' : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'}`}
           >
             {editingId ? 'UPDATE MATCH' : (link ? 'GO LIVE NOW 🚀' : 'SCHEDULE MATCH 📅')}
           </button>
        </div>

        {/* LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* ACTIVE / SCHEDULED MATCHES */}
          <div>
            <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Active & Scheduled
            </h2>
            <div className="space-y-3">
              {matches.filter(m => m.is_active).map(m => (
                <div key={m.id} className={`bg-slate-800 p-4 rounded-xl border transition group ${editingId === m.id ? 'border-blue-500' : 'border-green-500/20 hover:border-green-500/40'}`}>
                  <div className="flex justify-between items-start mb-3">
                     <div>
                       <div className="font-bold text-lg text-slate-200">{m.white_display_name} <span className="text-slate-600 text-sm">vs</span> {m.black_display_name}</div>
                       {/* STATUS INDICATOR */}
                       <div className="text-xs font-bold mt-1">
                         {m.lichess_url ? (
                            <span className="text-red-400 flex items-center gap-1">🔴 LIVE NOW</span>
                         ) : (
                            <span className="text-amber-500 flex items-center gap-1">📅 Scheduled: {new Date(m.start_time).toLocaleString()}</span>
                         )}
                       </div>
                     </div>
                     <button onClick={() => startEdit(m)} className="text-slate-500 hover:text-blue-400 bg-slate-900/50 p-2 rounded-lg transition" title="Edit">✎</button>
                  </div>
                  
                  {/* --- SCORE RECORDING (ONLY IF LIVE) --- */}
                  {m.lichess_url && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <button onClick={() => recordResult(m.id, "1 - 0")} className="bg-slate-900 hover:bg-green-900/50 border border-slate-700 hover:border-green-500 text-slate-300 hover:text-green-400 py-2 rounded font-bold text-xs transition">1 - 0</button>
                        <button onClick={() => recordResult(m.id, "½ - ½")} className="bg-slate-900 hover:bg-amber-900/50 border border-slate-700 hover:border-amber-500 text-slate-300 hover:text-amber-400 py-2 rounded font-bold text-xs transition">½ - ½</button>
                        <button onClick={() => recordResult(m.id, "0 - 1")} className="bg-slate-900 hover:bg-green-900/50 border border-slate-700 hover:border-green-500 text-slate-300 hover:text-green-400 py-2 rounded font-bold text-xs transition">0 - 1</button>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => toggleStatus(m.id, true)} className="flex-1 bg-slate-900 text-slate-400 py-2 rounded-lg hover:bg-slate-700 text-[10px] font-bold transition uppercase">Manual Archive</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-900/20 text-red-400 px-3 rounded-lg hover:bg-red-900/40 text-xs font-bold transition">DEL</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORY MATCHES */}
          <div>
            <h2 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">History</h2>
            <div className="space-y-3">
              {matches.filter(m => !m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition">
                  <div className="flex justify-between items-start mb-3">
                     <div className="font-bold text-slate-500">{m.white_display_name} vs {m.black_display_name}</div>
                     <button onClick={() => startEdit(m)} className="text-slate-600 hover:text-white bg-slate-900/50 p-2 rounded-lg transition" title="Edit">✎</button>
                  </div>
                  
                  {/* DISPLAY RESULT */}
                  {m.result ? (
                      <div className="bg-slate-900/50 text-center py-1 mb-3 rounded border border-slate-700 text-amber-500 font-mono font-bold text-sm">
                        {m.result}
                      </div>
                  ) : (
                      <div className="text-center py-1 mb-3 text-xs text-slate-600 italic">No result recorded</div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(m.id, false)} className="flex-1 bg-green-900/20 text-green-600 py-2 rounded-lg hover:bg-green-900/40 text-[10px] uppercase font-bold transition">Restage Live</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-slate-900 text-slate-600 px-3 rounded-lg hover:text-red-400 text-xs font-bold transition">✕</button>
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