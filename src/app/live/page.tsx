"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// 📊 CONFIG: DATA SOURCES
const DATA_SOURCES = [
  { 
    category: 'Adults', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=535970026&single=true&output=csv',
    rounds: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=1586830246&single=true&output=csv'
  },
  // ... (Juniors and Kids sources remain the same)
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

export default function Groups() {
  const [activeTab, setActiveTab] = useState('Adults');
  const [loading, setLoading] = useState(true);
  
  // State for parsed data
  const [standings, setStandings] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [groups, setGroups] = useState<any>({}); // { A: [players], B: [players] }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const source = DATA_SOURCES.find(s => s.category === activeTab);
      if (!source) return;

      try {
        // 1. Fetch Standings (To get Player IDs and Names)
        const standingsRes = await fetch(source.standings);
        const standingsText = await standingsRes.text();
        const standingsParsed = Papa.parse(standingsText, { header: true, skipEmptyLines: true });
        
        // 2. Fetch Rounds (To get Match Results)
        const roundsRes = await fetch(source.rounds);
        const roundsText = await roundsRes.text();
        const roundsParsed = Papa.parse(roundsText, { header: true, skipEmptyLines: true });

        // Process Data
        processData(standingsParsed.data, roundsParsed.data);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const processData = (standingsData: any[], roundsData: any[]) => {
    // 1. Map Players to Groups based on "Tournament ID"
    // Assuming 'Tournament ID' column exists. If not, check your CSV header name.
    const playerGroups: any = { A: [], B: [], C: [], P: [] }; // P for Kids (P1-P10)
    
    standingsData.forEach((player: any) => {
      const id = player['Tournament ID'] || player['ID']; // Adjust column name if needed
      const name = player['Nickname'] || player['Player Name'] || 'Unknown';
      const points = player['Points'] || player['Pts'] || 0;
      
      if (id) {
        // Check for GAP, GBP, GCP prefix
        if (id.startsWith('GAP')) playerGroups.A.push({ id, name, points });
        else if (id.startsWith('GBP')) playerGroups.B.push({ id, name, points });
        else if (id.startsWith('GCP')) playerGroups.C.push({ id, name, points }); // For Juniors
        else if (id.startsWith('P')) playerGroups.P.push({ id, name, points }); // For Kids
      }
    });

    // Sort players by points in each group
    Object.keys(playerGroups).forEach(key => {
        playerGroups[key].sort((a: any, b: any) => parseFloat(b.points) - parseFloat(a.points));
    });

    setGroups(playerGroups);
    setStandings(standingsData);
    setRounds(roundsData);
  };

  // Helper to find match result between two players (by ID or Name)
  // This is a simplified lookup. You might need to adjust based on your Rounds CSV structure.
  const getMatchResult = (p1: any, p2: any) => {
    // Look for a match where White=p1 & Black=p2 OR White=p2 & Black=p1
    // We need to match based on Name or ID depending on what's in the Rounds sheet.
    // Assuming Rounds sheet uses Names for 'White' and 'Black' columns.
    
    const match = rounds.find((r: any) => {
        const white = r['White'] || r['White Name'];
        const black = r['Black'] || r['Black Name'];
        return (white === p1.name && black === p2.name) || (white === p2.name && black === p1.name);
    });

    if (match) {
        // Return score if played
        // Check for 'White Points' / 'Black Points' or 'Result'
        const wPts = match['White Points'] || match['White Pts'];
        const bPts = match['Black Points'] || match['Black Pts'];
        
        if (wPts !== undefined && bPts !== undefined) {
             // If p1 was white
             if (match['White'] === p1.name) return `${wPts} - ${bPts}`;
             else return `${bPts} - ${wPts}`; // p1 was black
        }
    }
    return "-"; // Not played
  };


  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-400">
            ⚔️ Tournament Progress: {activeTab}
          </h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-sm font-bold">
            ← Home
          </a>
        </div>

        {/* 🎛️ CATEGORY TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 p-1 rounded-xl inline-flex shadow-lg border border-slate-700">
            {['Adults', 'Juniors', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse">
               <span className="text-2xl mb-2">⚔️</span>
               Analyzing Tournament Data...
             </div>
        )}

        {/* 🏆 VISUALIZATION AREA */}
        {!loading && (
            <div className="space-y-12">

                {/* --- ADULTS VIEW (Group A vs Group B) --- */}
                {activeTab === 'Adults' && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Group A Card */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h2 className="text-xl font-bold text-amber-500 mb-4 border-b border-slate-800 pb-2">Group A Standings</h2>
                            <div className="space-y-2">
                                {groups.A?.map((p: any, i: number) => (
                                    <div key={i} className={`flex justify-between p-3 rounded-lg border ${i < 2 ? 'bg-amber-900/20 border-amber-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                        <div className="flex gap-3">
                                            <span className={`font-mono font-bold w-6 ${i < 2 ? 'text-amber-400' : 'text-slate-500'}`}>{i+1}.</span>
                                            <span className="font-bold text-slate-200">{p.name}</span>
                                            <span className="text-xs text-slate-500 self-center font-mono">({p.id})</span>
                                        </div>
                                        <div className="font-bold text-slate-300">{p.points}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-slate-500 text-center italic">
                                * Top 2 qualify for Knockouts
                            </div>
                        </div>

                        {/* Group B Card */}
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h2 className="text-xl font-bold text-blue-500 mb-4 border-b border-slate-800 pb-2">Group B Standings</h2>
                             <div className="space-y-2">
                                {groups.B?.map((p: any, i: number) => (
                                    <div key={i} className={`flex justify-between p-3 rounded-lg border ${i < 2 ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-950 border-slate-800'}`}>
                                        <div className="flex gap-3">
                                            <span className={`font-mono font-bold w-6 ${i < 2 ? 'text-blue-400' : 'text-slate-500'}`}>{i+1}.</span>
                                            <span className="font-bold text-slate-200">{p.name}</span>
                                            <span className="text-xs text-slate-500 self-center font-mono">({p.id})</span>
                                        </div>
                                        <div className="font-bold text-slate-300">{p.points}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-slate-500 text-center italic">
                                * Top 2 qualify for Knockouts
                            </div>
                        </div>

                         {/* KNOCKOUT BRACKET PREVIEW (Simplified) */}
                        <div className="md:col-span-2 bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center mt-8">
                             <h2 className="text-2xl font-bold text-white mb-6">🏆 Knockout Stage</h2>
                             
                             <div className="flex justify-center items-center gap-4 md:gap-12 flex-wrap">
                                 {/* Semi 1 */}
                                 <div className="flex flex-col gap-2">
                                     <div className="bg-slate-800 p-4 rounded-lg border border-amber-500/30 w-48">
                                         <div className="text-xs text-amber-500 font-bold mb-1">A1 (Group A Winner)</div>
                                         <div className="font-bold text-white">{groups.A?.[0]?.name || 'TBD'}</div>
                                     </div>
                                     <div className="text-slate-500 font-bold text-xs">VS</div>
                                     <div className="bg-slate-800 p-4 rounded-lg border border-blue-500/30 w-48">
                                         <div className="text-xs text-blue-500 font-bold mb-1">B2 (Group B Runner-up)</div>
                                         <div className="font-bold text-white">{groups.B?.[1]?.name || 'TBD'}</div>
                                     </div>
                                 </div>

                                 {/* Final Connector */}
                                 <div className="hidden md:flex flex-col items-center">
                                     <div className="h-px w-12 bg-slate-600"></div>
                                     <div className="h-24 w-px bg-slate-600"></div>
                                     <div className="h-px w-12 bg-slate-600"></div>
                                 </div>

                                 {/* WINNER BOX */}
                                 <div className="bg-gradient-to-br from-amber-600 to-orange-700 p-6 rounded-xl shadow-2xl border border-amber-400 w-48 h-32 flex flex-col items-center justify-center transform scale-110">
                                     <div className="text-xs text-amber-200 font-bold uppercase tracking-widest mb-2">Champion</div>
                                     <div className="text-2xl font-black text-white">?</div>
                                 </div>

                                 {/* Final Connector */}
                                 <div className="hidden md:flex flex-col items-center">
                                     <div className="h-px w-12 bg-slate-600"></div>
                                     <div className="h-24 w-px bg-slate-600"></div>
                                     <div className="h-px w-12 bg-slate-600"></div>
                                 </div>

                                 {/* Semi 2 */}
                                 <div className="flex flex-col gap-2">
                                      <div className="bg-slate-800 p-4 rounded-lg border border-blue-500/30 w-48">
                                         <div className="text-xs text-blue-500 font-bold mb-1">B1 (Group B Winner)</div>
                                         <div className="font-bold text-white">{groups.B?.[0]?.name || 'TBD'}</div>
                                     </div>
                                     <div className="text-slate-500 font-bold text-xs">VS</div>
                                     <div className="bg-slate-800 p-4 rounded-lg border border-amber-500/30 w-48">
                                         <div className="text-xs text-amber-500 font-bold mb-1">A2 (Group A Runner-up)</div>
                                         <div className="font-bold text-white">{groups.A?.[1]?.name || 'TBD'}</div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
                
                {/* --- JUNIORS VIEW (3 Groups -> Super 6 -> Finals) --- */}
                {activeTab === 'Juniors' && (
                     <div className="space-y-8">
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Group A */}
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-blue-400 mb-2">Group A</h3>
                                <div className="text-sm space-y-1">
                                    {groups.A?.map((p:any, i:number) => (
                                        <div key={i} className={`flex justify-between ${i<2 ? 'text-blue-300 font-bold' : 'text-slate-500'}`}>
                                            <span>{i+1}. {p.name}</span>
                                            <span>{p.points}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Group B */}
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-purple-400 mb-2">Group B</h3>
                                <div className="text-sm space-y-1">
                                    {groups.B?.map((p:any, i:number) => (
                                        <div key={i} className={`flex justify-between ${i<2 ? 'text-purple-300 font-bold' : 'text-slate-500'}`}>
                                            <span>{i+1}. {p.name}</span>
                                            <span>{p.points}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Group C */}
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                                <h3 className="font-bold text-green-400 mb-2">Group C</h3>
                                <div className="text-sm space-y-1">
                                    {groups.C?.map((p:any, i:number) => (
                                        <div key={i} className={`flex justify-between ${i<2 ? 'text-green-300 font-bold' : 'text-slate-500'}`}>
                                            <span>{i+1}. {p.name}</span>
                                            <span>{p.points}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Progression Arrow */}
                        <div className="flex justify-center">
                            <span className="text-3xl">⬇️ Top 2 Advance ⬇️</span>
                        </div>

                        {/* Super Six Placeholder */}
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 text-center">
                            <h2 className="text-xl font-bold text-white mb-2">🌟 Super Six Stage</h2>
                            <p className="text-slate-400 text-sm">Top 2 from each group will compete here in a round-robin.</p>
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4">
                                {/* Placeholders for the 6 qualifiers */}
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-slate-900 p-3 rounded border border-slate-700 text-xs text-slate-500">
                                        Qualifier {i+1}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                )}

                 {/* --- KIDS VIEW (Simple Table for now, maybe bracket later) --- */}
                 {activeTab === 'Kids' && (
                     <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                         <h2 className="text-xl font-bold text-green-500 mb-4">League Table</h2>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-950 text-slate-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Rank</th>
                                        <th className="p-3">Player</th>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {groups.P?.map((p:any, i:number) => (
                                        <tr key={i} className="hover:bg-slate-800/50">
                                            <td className="p-3 font-mono text-slate-500">{i+1}</td>
                                            <td className={`p-3 font-bold ${i<4 ? 'text-green-400' : 'text-slate-300'}`}>
                                                {p.name} {i<4 && '✨'}
                                            </td>
                                            <td className="p-3 text-slate-500 font-mono text-xs">{p.id}</td>
                                            <td className="p-3 font-bold text-slate-200">{p.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                         <div className="mt-4 text-xs text-slate-500 text-center">
                            * Top 4 players qualify for Semifinals.
                         </div>
                     </div>
                 )}

            </div>
        )}

      </div>
    </main>
  );
}