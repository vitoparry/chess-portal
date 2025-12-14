"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Archive() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });
      if (data) setMatches(data);
    };
    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-400">
            📂 Match Archive
          </h1>
          {/* NAVIGATION BUTTON NOW ON RIGHT */}
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition font-bold text-sm border border-slate-700">
            ← Home
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {matches.length === 0 && (
          <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
            No archived matches found.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {matches.map((match) => (
            <div key={match.id} className="bg-slate-800/50 grayscale hover:grayscale-0 transition duration-500 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col group">
              
              <div className="bg-slate-900/50 p-3 md:p-4 flex justify-between items-center border-b border-slate-700 group-hover:bg-slate-900 transition">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                   <div className="flex flex-col min-w-0">
                      <span className="font-bold text-base md:text-lg leading-tight text-slate-300 group-hover:text-white truncate">
                        {match.white_display_name || match.white_name}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-600 group-hover:text-slate-500 font-mono truncate">@{match.white_name}</span>
                   </div>
                </div>

                <div className="px-2">
                   <span className="text-xs font-mono text-slate-600 border border-slate-700 px-2 py-1 rounded">Ended</span>
                </div>

                <div className="flex items-center justify-end gap-3 flex-1 min-w-0 text-right">
                   <div className="flex flex-col items-end min-w-0">
                      <span className="font-bold text-base md:text-lg leading-tight text-slate-300 group-hover:text-white truncate">
                        {match.black_display_name || match.black_name}
                      </span>
                      <span className="text-[10px] md:text-xs text-slate-600 group-hover:text-slate-500 font-mono truncate">@{match.black_name}</span>
                   </div>
                </div>
              </div>

              <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] opacity-80 group-hover:opacity-100 transition">
                <iframe 
                  src={`https://lichess.org/embed/${match.lichess_url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1]}?theme=auto&bg=auto`}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  style={{ pointerEvents: 'none' }}
                ></iframe>
              </div>
              
              <a href={match.lichess_url} target="_blank" className="bg-slate-900 text-center py-2 text-xs font-bold text-slate-500 hover:text-amber-500 hover:bg-slate-950 transition uppercase tracking-widest">
                Analyze on Lichess ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}