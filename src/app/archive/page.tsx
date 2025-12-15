"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import MatchCard from '../../components/MatchCard'; // Import

export default function Archive() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Adults');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
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

  const filteredMatches = matches.filter(m => (m.category || 'Adults') === activeTab);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-950 border-b border-slate-800 p-6 shadow-lg sticky top-0 z-50">
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
        
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 p-1 rounded-xl inline-flex shadow-lg border border-slate-700">
            {['Adults', 'Juniors', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">No archived matches found for {activeTab}.</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredMatches.map((match) => (
            <div key={match.id}>
                {/* We pass showScore={true} to enable the score badge */}
               <MatchCard match={match} showScore={true} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}