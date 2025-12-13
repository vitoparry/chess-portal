"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Fetch ALL matches (Live AND Archived)
  const fetchAllMatches = async () => {
    let { data } = await supabase
      .from('live_matches')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMatches(data);
  };

  useEffect(() => { fetchAllMatches(); }, []);

  // Toggle Function (Move between Live <-> Archive)
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (password !== 'club123') return alert("Password?");
    await supabase.from('live_matches').update({ is_active: !currentStatus }).eq('id', id);
    fetchAllMatches();
  };

  const handleDelete = async (id: string) => {
    if (password !== 'club123') return alert("Password?");
    if (!confirm("Permanently delete?")) return;
    await supabase.from('live_matches').delete().eq('id', id);
    fetchAllMatches();
  };

  const handlePublish = async () => {
    if (password !== 'club123') return alert("Wrong Password!");
    const { error } = await supabase.from('live_matches').insert([{ white_name: white, black_name: black, lichess_url: link, is_active: true }]);
    if (!error) { setWhite(''); setBlack(''); setLink(''); fetchAllMatches(); }
  };

  // Auto-fill logic (Same as before)
  const fetchLichessData = async () => {
    // ... (Use same logic as before or keep it simple for brevity here)
    if (!link.includes('lichess.org/')) return alert('Invalid Link');
    const gameId = link.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    setLoading(true);
    try {
      const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
      const text = await res.text();
      setWhite(text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown");
      setBlack(text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown");
    } catch (e) { alert("Error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 font-sans">
      <header className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-amber-500">Admin Control</h1>
        <a href="/" className="text-slate-400 hover:text-white">Go Home</a>
      </header>

      <div className="max-w-5xl mx-auto grid gap-8">
        {/* ADD FORM */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
           {/* ...Inputs same as before... */}
           <div className="flex gap-2 mb-4">
             <input className="flex-1 bg-slate-950 p-3 rounded border border-slate-600" placeholder="Lichess Link" value={link} onChange={e => setLink(e.target.value)} />
             <button onClick={fetchLichessData} disabled={loading} className="bg-blue-600 px-4 rounded font-bold">{loading ? '...' : 'Auto'}</button>
           </div>
           <div className="grid grid-cols-2 gap-4 mb-4">
             <input className="bg-slate-950 p-3 rounded border border-slate-600" placeholder="White" value={white} onChange={e => setWhite(e.target.value)} />
             <input className="bg-slate-950 p-3 rounded border border-slate-600" placeholder="Black" value={black} onChange={e => setBlack(e.target.value)} />
           </div>
           <div className="flex gap-4">
             <input type="password" className="bg-slate-950 p-3 rounded border border-slate-600" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
             <button onClick={handlePublish} className="flex-1 bg-green-600 rounded font-bold hover:bg-green-500">GO LIVE</button>
           </div>
        </div>

        {/* MATCH LISTS */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* COL 1: LIVE MATCHES */}
          <div>
            <h2 className="text-xl font-bold text-green-400 mb-4">🔴 Live Now</h2>
            <div className="space-y-3">
              {matches.filter(m => m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800 p-4 rounded border border-green-500/30 flex flex-col gap-2">
                  <div className="font-bold">{m.white_name} vs {m.black_name}</div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(m.id, true)} className="flex-1 bg-slate-700 text-slate-300 py-1 rounded hover:bg-slate-600">⬇ Archive</button>
                    <button onClick={() => handleDelete(m.id)} className="bg-red-900/50 text-red-400 px-3 rounded hover:bg-red-900">Del</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COL 2: ARCHIVE */}
          <div>
            <h2 className="text-xl font-bold text-slate-400 mb-4">📂 Archive</h2>
            <div className="space-y-3">
              {matches.filter(m => !m.is_active).map(m => (
                <div key={m.id} className="bg-slate-800/50 p-4 rounded border border-slate-700 flex flex-col gap-2 opacity-75">
                  <div className="font-bold text-slate-400">{m.white_name} vs {m.black_name}</div>
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