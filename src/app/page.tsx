"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Papa from 'papaparse';

// 📊 CONFIG: DATA SOURCES
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

// ⏳ CACHE SETTINGS (1 minute cache)
const CACHE_KEY = 'stv_dashboard_data_v5';
const CACHE_TIME_KEY = 'stv_dashboard_time_v5';
const CACHE_DURATION_MS = 1 * 60 * 1000; 

export default function Landing() {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({}); 
  const [leaders, setLeaders] = useState<any>({});
  const [loadingStats, setLoadingStats] = useState(true);

  // 1. Fetch Live Matches (Always Fresh)
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

  // 2. Fetch CSV Data (Stats & Leaders)
  useEffect(() => {
    const fetchCSVData = async () => {
      // Check Cache
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();

      if (cached && timestamp && (now - parseInt(timestamp) < CACHE_DURATION_MS)) {
        const parsed = JSON.parse(cached);
        setStats(parsed.stats);
        setLeaders(parsed.leaders);
        setLoadingStats(false);
        return;
      }

      const newStats: any = {};
      const newLeaders: any = {};

      for (const source of DATA_SOURCES) {
        try {
          // --- A. Process Rounds (Matches Played Stats) ---
          const roundsRes = await fetch(source.rounds);
          const roundsText = await roundsRes.text();
          const roundsParsed = Papa.parse(roundsText, { 
            header: true, 
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase()
          });
          
          const completedCount = roundsParsed.data.filter((r: any) => {
            // Find scoring columns robustly
            const keys = Object.keys(r);
            const wKey = keys.find(k => k.includes('white') && (k.includes('point') || k.includes('pts') || k.includes('score')));
            const bKey = keys.find(k => k.includes('black') && (k.includes('point') || k.includes('pts') || k.includes('score')));
            
            let wStr = wKey ? r[wKey] : '0';
            let bStr = bKey ? r[bKey] : '0';
            
            if(wStr === '½') wStr = '0.5';
            if(bStr === '½') bStr = '0.5';
            
            const w = parseFloat(wStr) || 0;
            const b = parseFloat(bStr) || 0;

            return (w + b) > 0;
          }).length;
          
          newStats[source.category] = { completed: completedCount };

          // --- B. Process Standings (Leaderboard) ---
          const standingsRes = await fetch(source.standings);
          const standingsText = await standingsRes.text();
          const standingsParsed = Papa.parse(standingsText, { header: false, skipEmptyLines: true });
          
          const rawRows = standingsParsed.data as string[][];
          
          // Filter out header rows (rows containing "Rank" or "Pos")
          const dataRows = rawRows.filter(row => {
             const firstCell = row[0]?.toString().toLowerCase();
             return firstCell !== 'rank' && firstCell !== '#' && firstCell !== 'pos';
          });

          const players = dataRows.map((row) => {
             // Nickname is in Column B (index 1)
             const name = row[1] ? row[1].trim() : 'Unknown';
             
             // Scan for Points (usually towards the end)
             let points = 0;
             for(let i = 2; i < row.length; i++) {
                const val = parseFloat(row[i]);
                if(!isNaN(val)) points = val;
             }
             return { name, points };
          })
          // 🔧 FILTER: Remove 0 point players
          .filter(p => p.name !== 'Unknown' && p.name !== '' && p.points > 0);

          // Sort Descending
          players.sort((a, b) => b.points - a.points);

          // Get Top 3 Scores (handling ties)
          const uniqueScores = Array.from(new Set(players.map(p => p.points))).slice(0, 3);
          const topPlayers = players.filter(p => uniqueScores.includes(p.points));
          
          newLeaders[source.category] = topPlayers.map(p => ({
              ...p,
              rank: uniqueScores.indexOf(p.points) + 1
          }));

        } catch (e) { console.error(`Error loading ${source.category}`, e); }
      }

      setStats(newStats);
      setLeaders(newLeaders);
      setLoadingStats(false);
      localStorage.setItem(CACHE_KEY, JSON.stringify({ stats: newStats, leaders: newLeaders }));
      localStorage.setItem(CACHE_TIME_KEY, now.toString());
    };

    fetchCSVData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-x-hidden">
      
      {/* Styles for Marquee Animation */}
      <style jsx global>{`
        @keyframes vertical-scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-vertical-scroll {
          /* SLOW SPEED: 45 seconds for a smooth drift */
          animation: vertical-scroll 45s linear infinite;
        }
        .animate-vertical-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none"></div>

      <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative z-10">

        {/* LEFT: Flyer */}
        <div className="md:col-span-3 flex flex-col items-center md:items-start justify-center gap-6 order-1">
            <div className="relative w-[70%] md:w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-2 border-slate-800 hover:scale-[1.02] transition duration-500">
                <Image src="/toruneyimage.jpg" alt="Tournament Flyer" fill className="object-cover" priority />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 leading-none drop-shadow-sm text-center md:text-left">
            STV CHESS<br/><span className="text-xl text-slate-400">CHAMPIONSHIP</span>
            </h1>
        </div>

        {/* CENTER: Buttons */}
        <div className="md:col-span-5 flex flex-col justify-center gap-6 w-full order-2">
            
            {/* LIVE TICKER */}
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

            {/* BUTTON GRID */}
            <div className="flex flex-col gap-4">
                <Link href="/live" className="group w-full">
                    <button className="w-full py-5 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition transform group-hover:-translate-y-1 flex items-center justify-center gap-2 border border-red-500/30">
                    <span className="animate-pulse">🔴</span> TODAY'S MATCHES
                    </button>
                </Link>
                
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/standings" className="group">
                        <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 rounded-xl font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">🏆 STANDINGS</button>
                    </Link>
                    <Link href="/groups" className="group">
                        <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg shadow-lg transition transform group-hover:-translate-y-1">⚔️ ROUNDS</button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Link href="/rules" className="group">
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-sm border border-slate-600 text-slate-300 hover:text-white transition">📜 Rules</button>
                    </Link>
                    <Link href="/procedure" className="group">
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-sm border border-slate-600 text-slate-300 hover:text-white transition">♟️ Guide</button>
                    </Link>
                </div>
                
                <Link href="/archive" className="group">
                     <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-sm border border-slate-700 text-slate-500 hover:text-slate-300 transition uppercase tracking-widest shadow-lg">
                        📂 Match Archive
                     </button>
                </Link>
            </div>
        </div>

        {/* RIGHT: Dashboard with AUTO-SCROLL */}
        <div className="md:col-span-4 flex flex-col gap-5 h-full order-3 w-full">
            
            {/* 1. 🏆 LEADERBOARD */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm h-full flex flex-col">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <span>👑</span> Top Leaders
                </h2>

                <div className="space-y-6 flex-1 overflow-hidden">
                    {['Adults', 'Juniors', 'Kids'].map((cat) => {
                        const catLeaders = leaders[cat] || [];
                        const needsScroll = catLeaders.length > 3;
                        
                        return (
                            <div key={cat} className="mb-4">
                                <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat==='Adults'?'text-amber-500':cat==='Juniors'?'text-blue-500':'text-green-500'}`}>
                                    {cat}
                                </h3>
                                
                                {/* CONTAINER */}
                                <div className={`relative ${needsScroll ? 'h-[110px] overflow-hidden' : ''}`}>
                                    <div className={`space-y-2 ${needsScroll ? 'animate-vertical-scroll' : ''}`}>
                                        
                                        {/* Original List */}
                                        {catLeaders.map((p:any, i:number) => (
                                            <div key={`${cat}-${i}`} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-mono font-bold w-4 text-center ${p.rank===1 ? 'text-yellow-400' : 'text-slate-600'}`}>{p.rank}</span>
                                                    <span className="text-xs font-bold text-slate-300 truncate max-w-[140px]">{p.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">{p.points} pts</span>
                                            </div>
                                        ))}

                                        {/* Duplicate List for Infinite Loop (only if scrolling) */}
                                        {needsScroll && catLeaders.map((p:any, i:number) => (
                                            <div key={`${cat}-dup-${i}`} className="flex justify-between items-center bg-slate-950/50 p-2 rounded border border-slate-800/50">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-mono font-bold w-4 text-center ${p.rank===1 ? 'text-yellow-400' : 'text-slate-600'}`}>{p.rank}</span>
                                                    <span className="text-xs font-bold text-slate-300 truncate max-w-[140px]">{p.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-slate-400">{p.points} pts</span>
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. 📊 INSIGHTS */}
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-xl backdrop-blur-sm">
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

      </div>

      <div className="absolute bottom-2 right-4 z-20">
        <Link href="/admin" className="text-[10px] text-slate-700 hover:text-amber-600 transition uppercase tracking-widest font-bold">🔒 Admin</Link>
      </div>

    </main>
  );
}