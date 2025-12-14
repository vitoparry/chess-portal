"use client"; // Need client for fetching
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Landing() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      // Fetch active matches, limited to 3 for the home page
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', true)
        .order('lichess_url', { ascending: false }) 
        .order('start_time', { ascending: true })
        .limit(3);
      if (data) setMatches(data);
    };
    fetchMatches();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 relative overflow-y-auto">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 mt-8 md:mt-12 text-center pb-20">
        
        {/* Flyer Image */}
        <div className="relative h-[25vh] md:h-[35vh] w-auto aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 hover:scale-[1.02] transition duration-500">
            <Image src="/toruneyimage.jpg" alt="Tournament Flyer" fill className="object-cover" priority />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm">
          STV CHAMPIONSHIP
        </h1>

        {/* 📅 UPCOMING MATCHES SECTION (New) */}
        {matches.length > 0 && (
          <div className="w-full max-w-lg bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> On The Schedule
             </h3>
             <div className="space-y-2">
                {matches.map(m => (
                  <div key={m.id} className="bg-slate-950/80 p-3 rounded-lg flex justify-between items-center border border-slate-800">
                     <div className="text-sm font-bold text-slate-200 text-left">
                       <div>{m.white_display_name}</div>
                       <div className="text-[10px] text-slate-500">vs</div>
                       <div>{m.black_display_name}</div>
                     </div>
                     <div className="text-right">
                       {m.lichess_url ? (
                         <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded animate-pulse">LIVE NOW</span>
                       ) : (
                         <div className="text-amber-500 font-bold text-xs bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">
                           {new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                       )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
          <Link href="/live" className="group col-span-1 md:col-span-2">
            <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg font-black text-xl shadow-[0_0_15px_rgba(220,38,38,0.4)] transition transform group-hover:-translate-y-1 flex items-center justify-center gap-2">
              <span className="animate-pulse">🔴</span> LIVE MATCHES
            </button>
          </Link>
          <Link href="/standings" className="group"><button className="w-full py-2 bg-amber-600 hover:bg-amber-500 rounded-lg font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">🏆 STANDINGS</button></Link>
          <Link href="/groups" className="group"><button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">⚔️ ROUNDS</button></Link>
          <Link href="/rules" className="group"><button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-base border border-slate-600 text-slate-300 group-hover:text-white transition">📜 Rules</button></Link>
          <Link href="/procedure" className="group"><button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium text-base border border-slate-600 text-slate-300 group-hover:text-white transition">♟️ Guide</button></Link>
          <Link href="/archive" className="group md:col-span-2"><button className="w-full py-2 bg-slate-900 hover:bg-slate-800 rounded-lg font-medium text-sm text-slate-500 border border-slate-800 hover:text-slate-300 transition">📂 Match Archive</button></Link>
        </div>

      </div>

      <div className="absolute bottom-4 right-4 z-20">
        <Link href="/admin" className="text-[10px] text-slate-700 hover:text-amber-600 transition uppercase tracking-widest font-bold flex items-center gap-1">🔒 Admin Portal</Link>
      </div>
    </main>
  );
}