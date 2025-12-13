"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);

  // Fetch data immediately when page loads
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
    // Auto-refresh every 10 seconds so people don't have to reload
    const interval = setInterval(fetchMatches, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-400">
        🏆 Championship Live Arena
      </h1>

      {/* The Split Screen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {matches.map((match) => (
          <div key={match.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            
            {/* Header: Names */}
            <div className="bg-gray-950 p-3 flex justify-between items-center text-lg font-bold border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-white"></span>
                {match.white_name}
              </div>
              <span className="text-gray-500 text-sm">VS</span>
              <div className="flex items-center gap-2">
                {match.black_name}
                <span className="w-3 h-3 rounded-full bg-black border border-white"></span>
              </div>
            </div>

            {/* The Live Board */}
            <div className="aspect-square w-full">
              <iframe 
                src={`https://lichess.org/embed/${match.lichess_url.split('/').pop()}?theme=auto&bg=auto`}
                className="w-full h-full"
                frameBorder="0"
              ></iframe>
            </div>
          </div>
        ))}

        {matches.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            Currently waiting for matches to start...
          </div>
        )}
      </div>
    </main>
  );
}