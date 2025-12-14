"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

// 🔒 SECURITY: Only these emails can access the admin panel
const ALLOWED_EMAILS = [
  "pradeepkaravadi@gmail.com", // <--- ENSURE YOUR EMAIL IS HERE
  "anotherxxx.admin@gmail.com"
];

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // Form State
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  const [whiteReal, setWhiteReal] = useState('');
  const [blackReal, setBlackReal] = useState('');
  const [link, setLink] = useState('');
  
  // System State
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // Track which match we are editing

  // --- AUTHENTICATION ---
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

  const checkAccess = (session: any) => {
    if (session?.user?.email && ALLOWED_EMAILS.includes(session.user.email)) {
      setAccessDenied(false);
      fetchAllMatches();
    } else if (session?.user?.email) {
      setAccessDenied(true);
    }
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
  };

  // --- DATA HANDLING ---
  const fetchAllMatches = async () => {
    let { data } = await supabase.from('live_matches').select('*').order('created_at', { ascending: false });
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

  // --- CORE ACTIONS ---

  // 1. START EDITING
  const startEdit = (match: any) => {
    setEditingId(match.id);
    setLink(match.lichess_url);
    setWhiteId(match.white_name);
    setBlackId(match.black_name);
    setWhiteReal(match.white_display_name || '');
    setBlackReal(match.black_display_name || '');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. CANCEL EDITING
  const cancelEdit = () => {
    setEditingId(null);
    setLink('');
    setWhiteId(''); setBlackId('');
    setWhiteReal(''); setBlackReal('');
  };

  // 3. PUBLISH (CREATE or UPDATE)
  const handlePublish = async () => {
    const finalWhiteName = whiteReal || whiteId;
    const finalBlackName = blackReal || blackId;

    const matchData = {
        white_name: whiteId,
        black_name: blackId,
        white_display_name: finalWhiteName,
        black_display_name: finalBlackName,
        lichess_url: link,
        is_active: true
    };

    if (editingId) {
        // UPDATE EXISTING MATCH
        const { error } = await supabase.from('live_matches').update(matchData).eq('id', editingId);
        if (!error) {
            cancelEdit(); // Reset form
            fetchAllMatches();
        } else {
            alert("Error updating match");
        }
    } else {
        // CREATE NEW MATCH
        const { error } = await supabase.from('live_matches').insert([matchData]);
        if (!error) {
            cancelEdit(); // Reset form
            fetchAllMatches();
        } else {
            alert("Error creating match");
        }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('live_matches').update({ is_active: !currentStatus }).eq('id', id);
    fetchAllMatches();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete?")) return;
    await supabase.from('live_matches').delete().eq('id', id);
    if (editingId === id) cancelEdit(); // If we were editing this, clear the form
    fetchAllMatches();
  };

  // --- RENDER ---
  if (!session) return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-white mb-6">🔒 Admin Access</h1>
          <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
            Sign in with Google
          </button>
        </div>
      </div>
  );

  if (accessDenied) return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p>Your email {session.user.email} is not authorized.</p>
          <button onClick={handleLogout} className="mt-4 bg-slate-700 px-4 py-2 rounded">Logout</button>
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold text-amber-500">Admin Control</h1>
           <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded-full border border-green-700">{session.user.email}</span>
        </div>
        <button onClick={handleLogout} className="bg-slate-800 border border-slate-600 px-4 py-2 rounded hover:bg-slate-700 transition">Logout</button>
      </header>

      <div className="max-w-5xl mx-auto grid gap-8">
        
        {/* INPUT FORM */}
        <div className={`p-6 rounded-xl border shadow-xl transition-colors duration-300 ${editingId ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-800 border-slate-700'}`}>
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold text-slate-300">
               {editingId ? '✏️ Editing Match...' : '🚀 New Match Entry'}
             </h2>
             {editingId && (
               <button onClick={cancelEdit} className="text-sm text-red-400 hover:text-red-300 underline">Cancel Edit</button>
             )}
           </div>
           
           <div className="flex gap-2 mb-6">
             <input className="flex-1 bg-slate-950 p-3 rounded border border-slate-600 focus:border-amber-500 outline-none" placeholder="Paste Lichess Link" value={link} onChange={e => setLink(e.target.value)} />
             <button onClick={fetchLichessData} disabled={loading} className="bg-blue-600 px-6 rounded font-bold hover:bg-blue-500 disabled:opacity-50">{loading ? '...' : 'Auto-Fill'}</button>
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

           <button 
             onClick={handlePublish} 
             className={`w-full py-4 rounded font-bold text-lg shadow-lg transition transform active:scale-95 ${editingId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-green-600 hover:bg-green-500'}`}
           >
             {editingId ? 'UPDATE MATCH 💾' : 'GO LIVE 🚀'}
           </button>
        </div>

        {/* LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-green-400 mb-4">🔴 Live Now</h2>
            <div className="space-y-3">
              {matches.filter(m => m.is_active).map(m => (
                <div key={m.id} className={`bg-slate-800 p-4 rounded border flex flex-col gap-2 ${editingId === m.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-green-500/30'}`}>
                  <div className="flex justify-between items-start">
                     <div>
                       <div className="font-bold text-lg">{m.white_display_name} vs {m.black_display_name}</div>
                       <div className="text-xs text-slate-500">ID: {m.white_name} vs {m.black_name}</div>
                     </div>
                     <button onClick={() => startEdit(m)} className="text-blue-400 hover:text-white bg-slate-900 p-2 rounded" title="Edit details">✎</button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => toggleStatus(m.id, true)} className="flex-1 bg-slate-700 text-slate-300 py-1 rounded hover:bg-slate-600">⬇ Archive</button>
                    <button onClick={() => handleDelete