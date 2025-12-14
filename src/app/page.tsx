"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Papa from 'papaparse';

// 📊 DATA SOURCES CONFIGURATION
// These links must match your Google Sheets "Publish to Web" CSV links exactly.
const DATA_SOURCES = [
  { 
    category: 'Adults', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=535970026&single=true&output=csv',
    rounds: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=1586830246&single=true&output=csv'
  },
  { 
    category: 'Juniors', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSugPx6ejmoqQGvkXMVZ2IC-5NKuKFuhrBkEFjSRr-lZbY1aQIfW0tQXllF6cSGNIHL7TXgklGosGZ6/pub?gid=45823858&single=true&output=csv',
    rounds: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSugPx6ejmoqQGvkXMVZ2IC-5NKuKFuhrBkEFjSRr-lZbY1aQIfW0tQXllF6cSGNIHL7TXgklGosGZ6/pub?gid=1273587789&single=true&output=csv'
  },
  { 
    category: 'Kids', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOj-HR4exbW-YvxAjDSe_l83xGXNbty52DoFhJQQqk7U97KVtKnh9F2QcG1Dn9z3hK9C6eGKqJA9ln/pub?gid=130837965&single=true&output=csv',
    rounds: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOj-HR4exbW-YvxAjDSe_l83xGXNbty52DoFhJQQqk7U97KVtKnh9F2QcG1Dn9z3hK9C6eGKqJA9ln/pub?gid=756584123&single=true&output=csv'
  }
];

export default function Landing() {
  // State Management
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({}); 
  const [leaders, setLeaders] = useState<any>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // 1. Fetch Live Matches from Supabase
  useEffect(() => {
    const fetchMatches = async () => {
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', true)
        .order('lichess_url', { ascending: false }) // Live matches first
        .order('start_time', { ascending: true })   // Then by time
        .limit(3);
      if (data) setLiveMatches(data);
    };
    fetchMatches();
  }, []);

  // 2. Fetch CSV Data (Stats & Leaders)
  useEffect(() => {
    const fetchCSVData = async () => {
      const newStats: any = {};
      const newLeaders: any = {};

      for (const source of DATA_SOURCES) {
        try {
          // --- A. Fetch Rounds (For "Matches Played" Count) ---
          const roundsRes = await fetch(source.rounds);
          const roundsText = await roundsRes.text();
          const roundsParsed = Papa.parse(roundsText, { header: true, skipEmptyLines: true });
          
          // LOGIC: Count match as completed if Total Score > 0
          // This ignores the Link column and focuses purely on results.
          const completedCount = roundsParsed.data.filter((r: any) => {
            // Normalize inputs (handle '½', '0.5', etc.)
            let wStr = r['White Points'] || '0';
            let bStr = r['Black Points'] || '0';
            if(wStr === '½') wStr = '0.5';
            if(bStr === '½') bStr = '0.5';
            
            const w = parseFloat(wStr);
            const b = parseFloat(bStr);

            // If sum is greater than 0 (e.g. 1-0, 0-1, 0.5-0.5), it counts as played.
            return (w + b) > 0;
          }).length;
          
          newStats[source.category] = {
            completed: completedCount,
            total: roundsParsed.data.length
          };

          // --- B. Fetch Standings (For Leaderboard) ---
          const standingsRes = await fetch(source.standings);
          const standingsText = await standingsRes.text();
          const standingsParsed = Papa.parse(standingsText, { header: true, skipEmptyLines: true });
          
          const rows: any[] = standingsParsed.data;
          // Extract Top 3 Players
          const top3 = rows.slice(0, 3).map((r: any) => ({
             name: r['Player Name'] || r['Name'] || r['Player'] || 'Unknown',
             points: r['Points'] || r['Pts'] || '0',
             rank: r['Rank'] || r['#']
          }));
          newLeaders[source.category] = top3;

        } catch (e) { console.error(`Error loading ${source.category}`, e); }
      }
      setStats(newStats);
      setLeaders(newLeaders);
      setLoadingStats(false);
    };

    fetchCSVData();
  }, []);

  return (
    // MAIN LAYOUT: Flex on mobile, 12-Column Grid on Desktop
    // Left (3 cols) | Center (5 cols) | Right (4 cols)
    <main className="min-h-screen bg-slate-950 text-white flex flex-col md:grid md:grid-cols-12 p-4 md:p-6 relative overflow-x-hidden gap-6 items-center">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      {/* ================= LEFT COLUMN (3/12): FLYER ================= */}
      <div className="relative z-10 md:col-span-3 flex flex-col items-center md:items-start justify-center h-full gap-4 order-1">
        {/* Flyer Image */}
        <div className="relative w-[70%] md:w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 hover:scale-[1.02] transition duration-500">
            <Image src="/toruneyimage.jpg" alt="Tournament Flyer" fill className="object-cover" priority />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 leading-none drop-shadow-sm text-center md:text-left">
          STV CHESS<br/><span className="text-xl text-slate-400">CHAMPIONSHIP</span>
        </h1>
      </div>

      {/* ================= CENTER COLUMN (5/12): BUTTONS ================= */}
      <div className="relative z-10 md:col-span-5 flex flex-col justify-center h-full gap-5 w-full max-w-md mx-auto order-2 px-2">
        
        {/* Live Ticker (Only shows if matches exist) */}
        {liveMatches.length > 0 && (
          <div className="w-full bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-sm mb-2">
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
               <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Live & Upcoming
             </h3>
             <div className="space-y-2">
                {liveMatches.map(m => (
                  <div key={m.id} className="bg-slate-950/80 px-3 py-2 rounded flex justify-between items-center border border-slate-800 text-xs shadow-inner">
                     <div className="font-bold text-slate-200 truncate pr-2">
                       {m.white_display_name} <span className="text-slate-600 px-1">vs</span> {m.black_display_name}
                     </div>
                     <div>
                       {m.lichess_url ? (
                         <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
                       ) : (
                         <span className="text-amber-500 font-mono font-bold bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-900/30">
                           {new Date(m.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       )}
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* BUTTON GRID */}
        <div className="flex flex-col gap-4 w-full">
            {/* BIG RED BUTTON */}
            <Link href="/live" className="group w-full">
                <button className="w-full py-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition transform group-hover:-translate-y-1 flex items-center justify-center gap-2 border border-red-500/30">
                <span className="animate-pulse">🔴</span> LIVE MATCHES
                </button>
            </Link>
            
            {/* ROW 1: Standings & Rounds */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/standings" className="group">
                    <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">
                        🏆 STANDINGS
                    </button>
                </Link>

                <Link href="/groups" className="group">
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">
                        ⚔️ ROUNDS
                    </button>
                </Link>
            </div>

            {/* ROW 2: Rules & Guide */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/rules" className="group">
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-sm border border-slate-600 text-slate-300 hover:text-white transition">
                        📜 Rules
                    </button>
                </Link>

                <Link href="/procedure" className="group">
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-sm border border-slate-600 text-slate-300 hover:text-white transition">
                        ♟️ Guide
                    </button>
                </Link>
            </div>
            
            <Link href="/archive" className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition uppercase tracking-widest font-bold">
                📂 Match Archive
            </Link>
        </div>
      </div>


      {/* ================= RIGHT COLUMN (4/12): DASHBOARD ================= */}
      <div className="relative z-10 md:col-span-4 flex flex-col gap-5 h-full overflow-y-auto order-3 w-full">
        
        {/* 1. 🏆 LEADERBOARD (Top Section) */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm flex-1 max-h-[60vh] overflow-y-auto">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2 sticky top-0 bg-slate-900/90 z-10">
             <span>👑</span> Top Leaders
           </h2>

           <div className="space-y-6">
              {['Adults', 'Juniors', 'Kids'].map((cat) => (
                  <div key={cat}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat==='Adults'?'text-amber-500':cat==='Juniors'?'text-blue-500':'text-green-500'}`}>
                        {cat} Top 3
                    </h3>
                    <div className="space-y-2">
                        {loadingStats ? <div className="text-xs text-slate-600 animate-pulse">Loading...</div> : 
                        leaders[cat]?.map((p:any, i:number) => (
                            <div key={i} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono font-bold w-4 text-center ${i===0 ? 'text-yellow-400' : 'text-slate-600'}`}>{i+1}</span>
                                    <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{p.name}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">{p.points}</span>
                            </div>
                        ))
                        }
                    </div>
                  </div>
              ))}
           </div>
        </div>

        {/* 2. 📊 INSIGHTS (Bottom Section) */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm h-fit">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
             <span>📊</span> Matches Played
           </h2>
           <div className="grid grid-cols-3 gap-2 text-center">
              {['Adults', 'Juniors', 'Kids'].map((cat) => (
                  <div key={cat} className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                    <div className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">{cat}</div>
                    <div className={`text-2xl font-black ${cat==='Adults'?'text-amber-500':cat==='Juniors'?'text-blue-500':'text-green-500'}`}>
                        {loadingStats ? '-' : (stats[cat]?.completed || 0)}
                    </div>
                  </div>
              ))}
           </div>
        </div>

      </div>

      {/* Footer Admin Link */}
      <div className="absolute bottom-2 right-4 z-20">
        <Link href="/admin" className="text-[10px] text-slate-700 hover:text-amber-600 transition uppercase tracking-widest font-bold">🔒 Admin</Link>
      </div>

    </main>
  );
}