"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveMatches, setLiveMatches] = useState<any[]>([]);

  // 1. Fetch logic
  const fetchLiveMatches = async () => {
    let { data } = await supabase
      .from('live_matches')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setLiveMatches(data);
  };

  useEffect(() => { fetchLiveMatches(); }, []);

  // 2. Auto-fill logic
  const fetchLichessData = async () => {
    if (!link.includes('lichess.org/')) return alert('Invalid Link');
    const gameId = link.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    if (!gameId) return alert('Could not find Game ID');

    setLoading(true);
    try {
      const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
      const text = await res.text();
      setWhite(text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown");
      setBlack(text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown");
    } catch (e) { alert("Failed to fetch. Enter manually."); }
    setLoading(false);
  };

  // 3. Publish logic
  const handlePublish = async () => {
    if (password !== 'club123') return alert("Wrong Admin Password!");
    const { error } = await supabase
      .from('live_matches')
      .insert([{ white_name: white, black_name: black, lichess_url: link, is_active: true }]);

    if (error) alert('Error adding match');
    else {
      setWhite(''); setBlack(''); setLink('');
      fetchLiveMatches(); 
    }
  };

  // 4. Delete & Bump logic
  const handleDelete = async (id: string) => {
    if (password !== 'club123') return alert("Password?");
    if (!confirm("Remove this match?")) return;
    await supabase.from('live_matches').delete().eq('id', id);
    fetchLiveMatches();
  };

  const handleBump = async (id: string) => {
    if (password !== 'club123') return alert("Password?");
    await supabase.from('live_matches').update({ created_at: new Date().toISOString() }).eq('id', id);
    fetchLiveMatches();
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. Header (Identical to Homepage) */}
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            ♟️ Admin Portal
          </h1>
          <a href="/" className="text-slate-400 hover:text-white text-sm font-bold transition">
            ← Back to Arena
          </a>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid gap-12">
        
        {/* 2. Control Panel (The Form) */}
        <section className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          <h2 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2">
            🚀 Launch New Match
          </h2>
          
          <div className="space-y-4">
            {/* Link & Auto-fill */}
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                className="flex-1 bg-slate-950 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none" 
                placeholder="Paste Lichess Link here..." 
                value={link} 
                onChange={e => setLink(e.target.value)} 
              />
              <button 
                onClick={fetchLichessData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? 'Thinking...' : '⚡ Auto-Fill'}
              </button>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                className="bg-slate-950 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-white outline-none" 
                placeholder="White Player" 
                value={white} 
                onChange={e => setWhite(e.target.value)} 
              />
              <input 
                className="bg-slate-950 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-white outline-none" 
                placeholder="Black Player" 
                value={black} 
                onChange={e => setBlack(e.target.value)} 
              />
            </div>

            {/* Password & Submit */}
            <div className="pt-4 border-t border-slate-700 flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="password"
                className="w-full md:w-64 bg-slate-950 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500" 
                placeholder="Admin Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
              />
              <button 
                onClick={handlePublish}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.4)] transition transform active:scale-95"
              >
                GO LIVE
              </button>
            </div>
          </div>
        </section>

        {/* 3. Live Dashboard (The List) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-100">Active Matches</h2>
            <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm border border-slate-700">
              {liveMatches.length} Live
            </span>
          </div>

          <div className="space-y-3">
            {liveMatches.length === 0 && (
              <div className="text-center py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
                No active games. The arena is quiet.
              </div>
            )}

            {liveMatches.map((match) => (
              <div key={match.id} className="group bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/50 hover:border-slate-600 flex flex-col md:flex-row items-center justify-between gap-4 transition">
                
                {/* Match Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></div>
                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 font-medium">
                    <span className="text-slate-200 text-lg">{match.white_name}</span>
                    <span className="text-slate-600 text-sm">VS</span>
                    <span className="text-slate-200 text-lg">{match.black_name}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <a 
                    href={match.lichess_url} 
                    target="_blank" 
                    className="flex-1 md:flex-none text-center px-4 py-2 bg-slate-900 hover:bg-slate-950 text-slate-400 text-sm rounded-lg transition border border-slate-700"
                  >
                    View ↗
                  </a>
                  <button 
                    onClick={() => handleBump(match.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg transition"
                    title="Move to top"
                  >
                    ⬆ Bump
                  </button>
                  <button 
                    onClick={() => handleDelete(match.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition"
                    title="End Game"
                  >
                    End ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}