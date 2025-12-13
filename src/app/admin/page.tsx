"use client";
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. New Function to fetch names from Lichess
  const fetchLichessData = async () => {
    if (!link.includes('lichess.org/')) return alert('Invalid Link');
    
    // Extract Game ID
    const gameId = link.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1];
    if (!gameId) return alert('Could not find Game ID');

    setLoading(true);
    try {
      // Call Lichess API
      const res = await fetch(`https://lichess.org/game/export/${gameId}?moves=false&clocks=false&evals=false`);
      const text = await res.text();
      
      // Parse PGN data for names
      const whiteName = text.match(/\[White "(.+?)"\]/)?.[1] || "Unknown";
      const blackName = text.match(/\[Black "(.+?)"\]/)?.[1] || "Unknown";
      
      setWhite(whiteName);
      setBlack(blackName);
    } catch (e) {
      alert("Failed to fetch from Lichess. Enter manually.");
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    if (password !== 'club123') return alert("Wrong Admin Password!");

    const { error } = await supabase
      .from('live_matches')
      .insert([{ white_name: white, black_name: black, lichess_url: link, is_active: true }]);

    if (error) alert('Error!');
    else {
      alert('Match is LIVE!');
      setWhite(''); setBlack(''); setLink('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-3xl font-bold text-amber-500">Admin Command Center</h1>
      
      <div className="w-full max-w-md bg-slate-800 p-6 rounded-xl shadow-xl flex flex-col gap-4">
        
        {/* Link Input + Fetch Button */}
        <div className="flex gap-2">
            <input 
                className="flex-1 p-3 text-black rounded bg-slate-100" 
                placeholder="Paste Lichess Link..." 
                value={link} 
                onChange={e => setLink(e.target.value)} 
            />
            <button 
                onClick={fetchLichessData}
                disabled={loading}
                className="bg-blue-600 px-4 rounded hover:bg-blue-500 disabled:opacity-50 text-sm font-bold"
            >
                {loading ? '...' : 'AUTO FILL'}
            </button>
        </div>

        <div className="flex gap-2">
            <input className="flex-1 p-3 text-black rounded" placeholder="White Name" value={white} onChange={e => setWhite(e.target.value)} />
            <input className="flex-1 p-3 text-black rounded" placeholder="Black Name" value={black} onChange={e => setBlack(e.target.value)} />
        </div>

        <input className="p-3 text-black rounded" type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} />
        
        <button onClick={handlePublish} className="w-full bg-green-600 py-3 rounded font-bold hover:bg-green-500 shadow-lg text-lg">
          GO LIVE 🔴
        </button>
      </div>

      <div className="border-t border-slate-700 w-full max-w-md pt-4 mt-4">
        <button onClick={async () => {
           if (password !== 'club123') return alert("Password?");
           await supabase.from('live_matches').update({ is_active: false }).eq('is_active', true);
           alert('All matches cleared');
        }} className="w-full bg-red-900/50 border border-red-500 text-red-200 py-2 rounded text-sm hover:bg-red-900">
          ⚠️ Emergency Stop All
        </button>
      </div>
    </div>
  );
}