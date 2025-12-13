"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Archive() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      // Logic: Fetch matches where is_active is FALSE (Archived)
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false }); // Newest first
      if (data) setMatches(data);
    };

    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-slate-400">
            📚 Match Archive
          </h1>
          <a href="/" className="text-amber-500 hover:text-amber-400 font-bold transition">
            ← Back Home
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {matches.length === 0 && (
          <div className="text-center py-20 text-slate-600">No archived matches found.</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800/50 grayscale hover:grayscale-0 transition duration-500 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col">
              <div className="bg-slate-900/50 p-4 flex justify-between items-center border-b border-slate-700">
                <span className="font-bold text-lg text-slate-300">{match.white_name}</span>
                <span className="text-xs font-mono text-slate-600">FINALIZED</span>
                <span className="font-bold text-lg text-slate-300">{match.black_name}</span>
              </div>
              <div className="relative w-full aspect-video">
                <iframe 
                  src={`https://lichess.org/embed/${match.lichess_url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1]}?theme=auto&bg=auto`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}