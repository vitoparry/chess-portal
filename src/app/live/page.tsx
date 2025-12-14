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
        .order('lichess_url', { ascending: false }) // Live matches first
        .order('start_time', { ascending: true }); // Then sorted by time
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
            <h2 className="text-xl">No scheduled matches at the moment.</h2>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col">
              
              {/* Header */}
              <div className="bg-slate-900/50 p-3 md:p-4 flex justify-between items-center border-b border-slate-700">
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-base md:text-xl leading-tight truncate text-slate-200">
                      {match.white_display_name || match.white_name}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-500 font-mono truncate">@{match.white_name}</span>
                </div>
                <div className="px-4">
                  <div className="bg-slate-950 px-3 py-1 rounded text-xs font-mono text-slate-500 tracking-widest border border-slate-800 font-bold">VS</div>
                </div>
                <div className="flex flex-col items-end flex-1 min-w-0">
                    <span className="font-bold text-base md:text-xl leading-tight truncate text-slate-200">
                      {match.black_display_name || match.black_name}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-500 font-mono truncate">@{match.black_name}</span>
                </div>
              </div>

              {/* CONTENT: EITHER BOARD OR SCHEDULED PLACEHOLDER */}
              {match.lichess_url ? (
                // 🔴 LIVE STATE
                <div className="relative w-full aspect-[3/4] md:aspect-video lg:aspect-[4/3]">
                  <iframe 
                    src={`https://lichess.org/embed/${match.lichess_url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1]}?theme=auto&bg=dark`} 
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                  ></iframe>
                </div>
              ) : (
                // 📅 SCHEDULED STATE
                <div className="relative w-full aspect-video bg-slate-950 flex flex-col items-center justify-center p-8 text-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                   <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-700 shadow-xl">
                      <span className="text-4xl">♟️</span>
                   </div>
                   <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-2">Match Scheduled For</h3>
                   <div className="text-2xl md:text-3xl font-black text-white bg-slate-900 px-6 py-2 rounded-xl border border-slate-800 shadow-lg">
                      {new Date(match.start_time).toLocaleString([], { weekday: 'short', hour: '2-digit', minute:'2-digit' })}
                   </div>
                   <p className="mt-4 text-xs text-slate-500">The board will appear here when the match starts.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}