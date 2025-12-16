"use client";
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MatchCard from '../../components/MatchCard';

export default function Live() {
  const [matches, setMatches] = useState<any[]>([]);
  // Use a ref to store the stringified data for comparison without triggering renders
  const lastDataStr = useRef('');

  useEffect(() => {
    const fetchMatches = async () => {
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', true)
        .order('lichess_url', { ascending: false }) 
        .order('start_time', { ascending: true });
      
      const newDataStr = JSON.stringify(data);
      
      // Only update state if data is genuinely different
      if (data && newDataStr !== lastDataStr.current) {
          lastDataStr.current = newDataStr;
          setMatches(data);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
            🔴 Live Arena
          </h1>
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
            <div key={match.id}>
               <MatchCard match={match} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}