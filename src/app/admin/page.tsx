"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  // Lichess IDs (Auto-filled)
  const [whiteId, setWhiteId] = useState('');
  const [blackId, setBlackId] = useState('');
  
  // Real Names (Manually typed)
  const [whiteReal, setWhiteReal] = useState('');
  const [blackReal, setBlackReal] = useState('');
  
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  const fetchAllMatches = async () => {
    let { data } = await supabase
      .from('live_matches')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setMatches(data);
  };

  useEffect(() => { fetchAllMatches(); }, []);

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
    
    // Fallback: If admin didn't type a real name, use the Lichess ID
    const finalWhiteName = whiteReal || whiteId;
    const finalBlackName = blackReal || blackId;

    const { error } = await supabase.from('live_matches').insert([{ 
        white_name: whiteId,           // Lichess ID
        black_name: blackId,           // Lichess ID
        white_display_name: finalWhiteName, // Real Name
        black_display_name: finalBlackName, // Real Name
        lichess_url: link, 
        is_active: true 
    }]);

    if (!error) { 
        setWhiteId(''); setBlackId(''); 
        setWhiteReal(''); setBlackReal('');
        setLink(''); 
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
      // Only fill the Lichess ID boxes
      setWhiteId(text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown");
      setBlackId(text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown");
    } catch (e) { alert("Error fetching data"); }
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
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
           <h2 className="text-lg font-bold mb-4 text-slate-300">New Match Entry</h2>
           
           <div className="flex gap-2 mb-6">
             <input className="flex-1 bg-slate-950 p-3 rounded border border-slate-600 focus:border-amber-500 outline-none" placeholder="Paste Lichess Link" value={link} onChange={e => setLink(e.target.value)} />
             <button onClick={fetchLichessData} disabled={loading} className="bg-blue-600 px-6 rounded font-bold hover:bg-blue-500 disabled:opacity-50">{loading ? '...' : 'Auto-Fill IDs'}</button>
           </div>

           <div className="grid grid-cols-2 gap-6 mb-6">
             {/* WHITE SIDE */}
             <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">White Player</label>
                <input className="w-full bg-slate-950 p-3 rounded border border-slate-500 text-amber-400 font-bold" placeholder="Real Name (e.g. Pranavath)" value={whiteReal} onChange={e => setWhiteReal(e.target.value)} />
                <input className="w-full bg-slate-900 p-2 rounded border border-slate-700 text-sm text-slate-400" placeholder="Lichess ID (Auto-filled)" value={whiteId} onChange={e => setWhiteId(e.target.value)} />
             </div>

             {/* BLACK SIDE */}
             <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Black Player</label>
                <input className="w-full bg-slate-950 p-3 rounded border border-slate-500 text-amber-400 font-bold" placeholder="Real Name (e.g. Arun)" value={blackReal} onChange={e => setBlackReal(e.target.value)} />
                <input className="w-full bg-slate-900 p-2 rounded border border-slate-700 text-sm text-slate-400" placeholder="Lichess ID (Auto-filled)" value={blackId} onChange={e => setBlackId(e.target.value)} />
             </div>
           </div>

           <div className="flex gap-4 border-t border-slate-700 pt-6">
             <input type="password" className="bg-slate-950 p-3 rounded border border-slate-600" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
             <button onClick={handlePublish} className="flex-1 bg-green-600 rounded font-bold hover:bg-green-500 text-lg shadow-lg">GO LIVE 🚀</button>
           </div>
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