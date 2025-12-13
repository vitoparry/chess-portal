"use client";
import { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Admin() {
  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [link, setLink] = useState('');
  const [password, setPassword] = useState('');

  const handlePublish = async () => {
    if (password !== 'club123') return alert("Wrong Admin Password!"); // Simple security

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <input className="p-2 text-black rounded" placeholder="White Name" value={white} onChange={e => setWhite(e.target.value)} />
      <input className="p-2 text-black rounded" placeholder="Black Name" value={black} onChange={e => setBlack(e.target.value)} />
      <input className="p-2 text-black rounded" placeholder="Lichess Link" value={link} onChange={e => setLink(e.target.value)} />
      <input className="p-2 text-black rounded" type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)} />
      
      <button onClick={handlePublish} className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500">
        GO LIVE 🔴
      </button>
      
      {/* Button to clear old matches */}
      <button onClick={async () => {
         if (password !== 'club123') return;
         await supabase.from('live_matches').update({ is_active: false }).eq('is_active', true);
         alert('All matches cleared');
      }} className="bg-red-600 px-6 py-2 rounded text-sm">
        Stop All Matches
      </button>
    </div>
  );
}