"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Live() {
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
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            🔴 Live Arena
          </h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition font-bold text-sm border border-slate-700">
            ← Home
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <h2 className="text-xl">Waiting for matches to start...</h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
              
              {/* Card Header */}
              <div className="bg-slate-900/50 p-3 md:p-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-100 border border-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.5)] shrink-0"></div>
                  <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base md:text-xl leading-tight truncate">
                        {match.white_display_name || match.white_name}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-500 font-mono truncate">@{match.white_name}</span>
                  </div>
                </div>

                <div className="px-2">
                  <div className="bg-slate-800 px-2 py-1 rounded text-[10px] md:text-xs font-mono text-slate-500 tracking-widest border border-slate-700">VS</div>
                </div>

                <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
                  <div className="flex flex-col items-end min-w-0">
                      <span className="font-bold text-base md:text-xl leading-tight truncate">
                        {match.black_display_name || match.black_name}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-500 font-mono truncate">@{match.black_name}</span>
                  </div>
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-slate-900 border border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.5)] shrink-0"></div>
                </div>
              </div>

              {/* The Board - FORCED DARK MODE */}
              <div className="relative w-full aspect-[3/4] md:aspect-video lg:aspect-[4/3]">
                <iframe 
                  src={`https://lichess.org/embed/${match.lichess_url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1]}?theme=auto&bg=dark`} 
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