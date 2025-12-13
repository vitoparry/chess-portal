"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (data) setMatches(data);
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navbar / Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            ♟️ Club Championship
          </h1>
          <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm font-bold border border-red-500/20 animate-pulse">
            LIVE NOW
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Empty State */}
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="text-xl">Waiting for matches to start...</h2>
          </div>
        )}

        {/* The Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
              
              {/* Match Header */}
              <div className="bg-slate-900/50 p-4 flex justify-between items-center border-b border-slate-700">
                {/* White Player */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                  <span className="font-bold text-lg md:text-xl truncate max-w-[120px]">{match.white_name}</span>
                </div>

                {/* VS Badge */}
                <div className="bg-slate-800 px-3 py-1 rounded text-xs font-mono text-slate-500 tracking-widest">
                  VS
                </div>

                {/* Black Player */}
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg md:text-xl truncate max-w-[120px] text-right">{match.black_name}</span>
                  <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                </div>
              </div>

              {/* The Board (Responsive Height) */}
              <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3]">
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