"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MatchCard from '../../components/MatchCard';

export default function Live() {
  const [matches, setMatches] = useState<any[]>([]);
  const lastDataStr = useRef('');

  useEffect(() => {
    const fetchMatches = async () => {
      // 1. Calculate Today's Midnight (Local Time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // 2. Fetch matches that are either:
      //    a) Currently Active (is_active = true)
      //    b) OR Finished but started/created Today (start_time >= today)
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .or(`is_active.eq.true,start_time.gte.${todayISO},created_at.gte.${todayISO}`)
        .order('is_active', { ascending: false }) // Live first
        .order('start_time', { ascending: true }); // Then by time
      
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

  // Filter into two buckets
  const liveMatches = matches.filter(m => m.is_active);
  const concludedMatches = matches.filter(m => !m.is_active);

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

        {/* SECTION 2: CONCLUDED TODAY */}
        {concludedMatches.length > 0 && (
          <section>
             <h2 className="text-xl font-bold text-slate-400 mb-4 flex items-center gap-2">
                <span>✅</span> Concluded Today
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
                      {/* Note: We use updated_at as a proxy for 'End Time' if available, or just show 'Final' */}
                      <div>
                        <span className="text-slate-600 mr-2">End:</span>
                        {match.updated_at ? formatTime(match.updated_at) : 'Final'}
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
            <h2 className="text-xl">No matches scheduled for today.</h2>
          </div>
        )}

      </div>
    </main>
  );
}