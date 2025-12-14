"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Landing() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
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
    // MAIN CONTAINER: Flex col on mobile, Split Grid on Desktop
    // h-screen and overflow-hidden ensures NO SCROLL on desktop
    <main className="min-h-screen md:h-screen md:max-h-screen bg-slate-950 text-white flex flex-col md:grid md:grid-cols-2 p-4 md:p-8 relative md:overflow-hidden gap-6">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      {/* LEFT COLUMN: Visuals & Info */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full gap-4 md:gap-6">
        
        {/* Flyer Image - Adjusted size for split screen */}
        <div className="relative h-[30vh] md:h-[45vh] w-auto aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 hover:scale-[1.02] transition duration-500">
            <Image src="/toruneyimage.jpg" alt="Tournament Flyer" fill className="object-cover" priority />
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm leading-tight">
          STV<br/>CHAMPIONSHIP
        </h1>

        {/* 📅 SCHEDULE (Compact Version) */}
        {matches.length > 0 && (
          <div className="w-full max-w-md bg-slate-900/50 p-3 rounded-xl border border-slate-800 backdrop-blur-sm">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> On The Schedule
             </h3>
             <div className="space-y-1">
                {matches.map(m => (
                  <div key={m.id} className="bg-slate-950/80 px-3 py-2 rounded flex justify-between items-center border border-slate-800 text-xs">
                     <div className="font-bold text-slate-200">
                       {m.white_display_name} <span className="text-slate-600 px-1">vs</span> {m.black_display_name}
                     </div>
                     <div>
                       {m.lichess_url ? (
                         <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
                       ) : (
                         <span className="text-amber-500 font-mono font-bold bg-amber-900/20 px-1.5 py-0.5 rounded">
                           {new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Buttons (Centered & Spaced) */}
      <div className="relative z-10 flex flex-col justify-center h-full gap-4 md:gap-6 max-w-md mx-auto w-full">
          
          <Link href="/live" className="group w-full">
            <button className="w-full py-6 md:py-8 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-2xl font-black text-2xl md:text-3xl shadow-[0_0_25px_rgba(220,38,38,0.3)] transition transform group-hover:-translate-y-1 flex items-center justify-center gap-3 border border-red-500/30">
              <span className="animate-pulse">🔴</span> LIVE MATCHES
            </button>
          </Link>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <Link href="/standings" className="group">
                <button className="w-full h-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-lg md:text-xl shadow-lg transition transform group-hover:-translate-y-1">
                    🏆 STANDINGS
                </button>
            </Link>

            <Link href="/groups" className="group">
                <button className="w-full h-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg md:text-xl shadow-lg transition transform group-hover:-translate-y-1">
                    ⚔️ ROUNDS
                </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <Link href="/rules" className="group">
                <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-base md:text-lg border border-slate-600 text-slate-300 group-hover:text-white transition">
                    📜 Rules
                </button>
            </Link>

            <Link href="/procedure" className="group">
                <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-base md:text-lg border border-slate-600 text-slate-300 group-hover:text-white transition">
                    ♟️ Guide
                </button>
            </Link>
          </div>

          <Link href="/archive" className="group w-full">
            <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 rounded-xl font-medium text-sm text-slate-500 border border-slate-800 hover:text-slate-300 transition uppercase tracking-widest">
              📂 Match Archive
            </button>
          </Link>
      </div>

      {/* Footer Admin Link */}
      <div className="absolute bottom-2 right-4 z-20">
        <Link href="/admin" className="text-[10px] text-slate-700 hover:text-amber-600 transition uppercase tracking-widest font-bold">🔒 Admin</Link>
      </div>

    </main>
  );
}