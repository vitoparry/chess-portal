"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MatchCard from '../../components/MatchCard';

export default function Live() {
  const [matches, setMatches] = useState<any[]>([]);
  const lastDataStr = useRef('');

  useEffect(() => {
    const fetchMatches = async () => {
      // 1. Calculate 24 Hours Ago (Rolling Window)
      // This ensures matches created yesterday but finished today don't vanish immediately
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);
      const lookbackISO = yesterday.toISOString();

      // 2. Fetch matches:
      //    a) Active matches (Always show)
      //    b) OR Matches updated/created in the last 24 hours (Show in Concluded)
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .or(`is_active.eq.true,created_at.gte.${lookbackISO},start_time.gte.${lookbackISO}`)
        .order('is_active', { ascending: false }) // Live first
        .order('start_time', { ascending: false }); // Newest matches at the top (Descending)
      
      const newDataStr = JSON.stringify(data);
      
      if (data && newDataStr !== lastDataStr.current) {
          lastDataStr.current = newDataStr;
          setMatches(data);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000); 
    return () => clearInterval(interval);
  }, []);

  // Filter Logic:
  // Live = Active AND No Result yet.
  const liveMatches = matches
    .filter(m => m.is_active && !m.result)
    // Extra safety sort: Newest live match on top
    .sort((a, b) => new Date(b.start_time || b.created_at).getTime() - new Date(a.start_time || a.created_at).getTime());

  // Concluded = Not Active OR Has a Result
  const concludedMatches = matches
    .filter(m => !m.is_active || m.result)
    .sort((a, b) => new Date(b.start_time || b.created_at).getTime() - new Date(a.start_time || a.created_at).getTime());

  // Helper for formatting time
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            📅 Today's Matches
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-12">
        
        {/* SECTION 1: LIVE NOW */}
        {liveMatches.length > 0 && (
          <section>
             <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2 animate-pulse">
                <span>🔴</span> Live Now
             </h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {liveMatches.map((match) => (
                <div key={match.id} className="flex flex-col gap-2">
                   {/* Ensure key is on the wrapper to help React diffing */}
                   <MatchCard match={match} />
                   <div className="flex justify-between px-2 text-xs text-slate-500 font-mono">
                      <span>Started: {formatTime(match.start_time || match.created_at)}</span>
                      <span className="text-green-500">In Progress...</span>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: CONCLUDED TODAY (Last 24h) */}
        {concludedMatches.length > 0 && (
          <section>
             <h2 className="text-xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                <span>✅</span> Concluded (Last 24h)
             </h2>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {concludedMatches.map((match) => (
                <div key={match.id} className="flex flex-col gap-2 opacity-90 hover:opacity-100 transition">
                   {/* Pass showScore to see the result immediately */}
                   <MatchCard match={match} showScore={true} />
                   
                   {/* Timestamp Footer */}
                   <div className="flex justify-between px-2 text-xs text-slate-500 font-mono bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-600 mr-2">Start:</span>
                        {formatTime(match.start_time || match.created_at)}
                      </div>
                      <div>
                        <span className="text-slate-600 mr-2">Result:</span>
                        <span className="text-amber-500 font-bold">{match.result || 'Ended'}</span>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <h2 className="text-xl">No active or recent matches found.</h2>
          </div>
        )}

      </div>
    </main>
  );
}