"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Papa from 'papaparse';

// 📊 DATA SOURCES (Same as your Admin/Standings pages)
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
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({}); // Stores completed match counts
  const [leaders, setLeaders] = useState<any>({}); // Stores Top 3 players
  const [loadingStats, setLoadingStats] = useState(true);

  // 1. Fetch Live/Scheduled Matches (Supabase)
  useEffect(() => {
    const fetchMatches = async () => {
      let { data } = await supabase
        .from('live_matches')
        .select('*')
        .eq('is_active', true)
        .order('lichess_url', { ascending: false }) 
        .order('start_time', { ascending: true })
        .limit(3);
      if (data) setLiveMatches(data);
    };
    fetchMatches();
  }, []);

  // 2. Fetch CSV Stats & Leaderboards
  useEffect(() => {
    const fetchCSVData = async () => {
      const newStats: any = {};
      const newLeaders: any = {};

      for (const source of DATA_SOURCES) {
        try {
          // A. Fetch Rounds (For Insights)
          const roundsRes = await fetch(source.rounds);
          const roundsText = await roundsRes.text();
          const roundsParsed = Papa.parse(roundsText, { header: true, skipEmptyLines: true });
          
          // Count completed matches (where 'Winner' or 'White Points' is not empty)
          const completedCount = roundsParsed.data.filter((r: any) => 
            (r['Winner'] && r['Winner'].trim() !== '') || (r['White Points'] && r['White Points'].trim() !== '')
          ).length;
          
          newStats[source.category] = {
            completed: completedCount,
            total: roundsParsed.data.length
          };

          // B. Fetch Standings (For Leaderboard)
          const standingsRes = await fetch(source.standings);
          const standingsText = await standingsRes.text();
          const standingsParsed = Papa.parse(standingsText, { header: true, skipEmptyLines: true });
          
          // Take Top 3 rows (assuming sheet is sorted)
          // Look for 'Player Name' or 'Name' column dynamically
          const rows: any[] = standingsParsed.data;
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
    <main className="min-h-screen bg-slate-950 text-white flex flex-col md:grid md:grid-cols-12 p-4 md:p-6 relative overflow-x-hidden gap-6">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      {/* ================= LEFT COLUMN (40%): Nav & Action ================= */}
      <div className="relative z-10 md:col-span-5 flex flex-col h-full gap-5 md:pr-6 border-r-0 md:border-r border-slate-800/50">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-4 mb-2">
            <div className="relative h-[25vh] w-auto aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 hover:scale-[1.02] transition duration-500">
                <Image src="/toruneyimage.jpg" alt="Tournament Flyer" fill className="object-cover" priority />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 leading-none drop-shadow-sm">
              STV CHESS<br/><span className="text-2xl text-slate-400">CHAMPIONSHIP</span>
            </h1>
        </div>

        {/* 🔴 LIVE / SCHEDULED TICKER */}
        {liveMatches.length > 0 && (
          <div className="w-full bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-sm">
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

        {/* NAVIGATION BUTTONS (Uniform Grid) */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          {/* Row 1: Live & Standings */}
          <Link href="/live" className="group col-span-2">
            <button className="w-full py-4 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-xl font-black text-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition transform group-hover:-translate-y-1 flex items-center justify-center gap-2 border border-red-500/30">
              <span className="animate-pulse">🔴</span> LIVE MATCHES
            </button>
          </Link>
          
          <Link href="/standings" className="group">
            <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-sm md:text-base shadow-lg transition transform group-hover:-translate-y-1">
                🏆 STANDINGS
            </button>
          </Link>

          <Link href="/groups" className="group">
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm md:text-base shadow-lg transition transform group-hover:-translate-y-1">
                ⚔️ ROUNDS
            </button>
          </Link>

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
          
          <Link href="/archive" className="col-span-2 text-center py-2 text-xs text-slate-500 hover:text-slate-300 transition uppercase tracking-widest font-bold">
             📂 Match Archive
          </Link>
        </div>
      </div>


      {/* ================= RIGHT COLUMN (60%): Dashboard ================= */}
      <div className="relative z-10 md:col-span-7 flex flex-col gap-6 h-full overflow-y-auto pb-10">
        
        {/* 📊 DAILY INSIGHTS CARD */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
             <span>📊</span> Tournament Insights
           </h2>
           <div className="grid grid-cols-3 gap-4 text-center">
              {/* Adults Stat */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Adults Matches</div>
                 <div className="text-2xl md:text-3xl font-black text-amber-500">
                    {loadingStats ? '...' : (stats['Adults']?.completed || 0)}
                 </div>
                 <div className="text-[9px] text-slate-600">Total Played</div>
              </div>
              {/* Juniors Stat */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Juniors Matches</div>
                 <div className="text-2xl md:text-3xl font-black text-blue-500">
                    {loadingStats ? '...' : (stats['Juniors']?.completed || 0)}
                 </div>
                 <div className="text-[9px] text-slate-600">Total Played</div>
              </div>
              {/* Kids Stat */}
              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800">
                 <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Kids Matches</div>
                 <div className="text-2xl md:text-3xl font-black text-green-500">
                    {loadingStats ? '...' : (stats['Kids']?.completed || 0)}
                 </div>
                 <div className="text-[9px] text-slate-600">Total Played</div>
              </div>
           </div>
        </div>

        {/* 🏆 LEADERBOARDS (Top 3) */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm flex-1">
           <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
             <span>👑</span> Top Leaders
           </h2>

           <div className="space-y-6">
              
              {/* ADULTS LEADERS */}
              <div>
                 <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Adults Top 3</h3>
                 <div className="grid grid-cols-1 gap-2">
                    {loadingStats ? <div className="text-xs text-slate-600">Loading...</div> : 
                      leaders['Adults']?.map((p:any, i:number) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/50">
                           <div className="flex items-center gap-3">
                              <span className={`font-mono font-bold w-5 text-center ${i===0 ? 'text-yellow-400' : 'text-slate-500'}`}>{i+1}</span>
                              <span className="text-sm font-bold text-slate-200">{p.name}</span>
                           </div>
                           <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-amber-500">{p.points} pts</span>
                        </div>
                      ))
                    }
                 </div>
              </div>

              {/* JUNIORS LEADERS */}
              <div>
                 <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Juniors Top 3</h3>
                 <div className="grid grid-cols-1 gap-2">
                    {loadingStats ? <div className="text-xs text-slate-600">Loading...</div> : 
                      leaders['Juniors']?.map((p:any, i:number) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/50">
                           <div className="flex items-center gap-3">
                              <span className={`font-mono font-bold w-5 text-center ${i===0 ? 'text-yellow-400' : 'text-slate-500'}`}>{i+1}</span>
                              <span className="text-sm font-bold text-slate-200">{p.name}</span>
                           </div>
                           <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-blue-400">{p.points} pts</span>
                        </div>
                      ))
                    }
                 </div>
              </div>

              {/* KIDS LEADERS */}
              <div>
                 <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2">Kids Top 3</h3>
                 <div className="grid grid-cols-1 gap-2">
                    {loadingStats ? <div className="text-xs text-slate-600">Loading...</div> : 
                      leaders['Kids']?.map((p:any, i:number) => (
                        <div key={i} className="flex justify-between items-center bg-slate-950 p-2 rounded border border-slate-800/50">
                           <div className="flex items-center gap-3">
                              <span className={`font-mono font-bold w-5 text-center ${i===0 ? 'text-yellow-400' : 'text-slate-500'}`}>{i+1}</span>
                              <span className="text-sm font-bold text-slate-200">{p.name}</span>
                           </div>
                           <span className="text-xs font-bold bg-slate-800 px-2 py-1 rounded text-green-400">{p.points} pts</span>
                        </div>
                      ))
                    }
                 </div>
              </div>

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