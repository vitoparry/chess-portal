"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';

export default function Archive() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Adults');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      // Fetch ALL archived matches
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', false)
        .order('created_at', { ascending: false });
      if (data) setMatches(data);
      setLoading(false);
    };
    fetchMatches();
  }, []);

  // Filter matches based on the selected tab
  const filteredMatches = matches.filter(m => 
    (m.category || 'Adults') === activeTab // Default to Adults if category is missing
  );

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-400">
            📂 Match Archive
          </h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition font-bold text-sm border border-slate-700">
            ← Home
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        
        {/* 🎛️ CATEGORY TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 p-1 rounded-xl inline-flex shadow-lg border border-slate-700">
            {['Adults', 'Juniors', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-amber-600 text-white shadow-md transform scale-105' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && <div className="text-center py-20 text-slate-500 animate-pulse">Loading Archive...</div>}

        {/* EMPTY STATE */}
        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
            No archived matches found for {activeTab}.
          </div>
        )}

        {/* MATCH GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredMatches.map((match) => (
            <div key={match.id} className="bg-slate-800/50 grayscale hover:grayscale-0 transition duration-500 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col group">
              
              <div className="bg-slate-900/50 p-3 md:p-4 flex justify-between items-center border-b border-slate-700 group-hover:bg-slate-900 transition">
                {/* White */}
                <div className={`flex flex-col min-w-0 flex-1 ${match.result === '1 - 0' ? 'text-green-400' : 'text-slate-300'}`}>
                    <span className="font-bold text-base md:text-lg leading-tight truncate">
                      {match.white_display_name || match.white_name}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-600 font-mono truncate">@{match.white_name}</span>
                </div>

                {/* Score */}
                <div className="px-4 text-center">
                   {match.result ? (
                     <div className="text-xl font-bold font-mono text-amber-500 bg-slate-950 px-3 py-1 rounded border border-slate-800 shadow-inner">
                       {match.result}
                     </div>
                   ) : (
                     <span className="text-xs font-mono text-slate-600 border border-slate-700 px-2 py-1 rounded">Ended</span>
                   )}
                </div>

                {/* Black */}
                <div className={`flex flex-col items-end min-w-0 flex-1 text-right ${match.result === '0 - 1' ? 'text-green-400' : 'text-slate-300'}`}>
                    <span className="font-bold text-base md:text-lg leading-tight truncate">
                      {match.black_display_name || match.black_name}
                    </span>
                    <span className="text-[10px] md:text-xs text-slate-600 font-mono truncate">@{match.black_name}</span>
                </div>
              </div>

              {/* Lichess Embed */}
              <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] opacity-80 group-hover:opacity-100 transition">
                <iframe 
                  src={`https://lichess.org/embed/${match.lichess_url.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/)?.[1]}?theme=auto&bg=dark`}
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