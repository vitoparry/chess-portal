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
  const [data, setData] = useState<any>(null); // Stores processed group data

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const source = DATA_SOURCES.find(s => s.category === activeTab);
      if (!source) return;

      try {
        // Fetch Standings
        const standingsRes = await fetch(source.standings);
        const standingsText = await standingsRes.text();
        const standingsParsed = Papa.parse(standingsText, { header: true, skipEmptyLines: true });

        // Process Data based on Category
        const processed = processCategoryData(activeTab, standingsParsed.data);
        setData(processed);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const processCategoryData = (category: string, standings: any[]) => {
    // Helper to parse points
    const getPoints = (p: any) => parseFloat(p['Points'] || p['Pts'] || p['Total'] || '0');

    if (category === 'Adults') {
      // Filter by ID prefix
      const groupA = standings.filter((p: any) => p['Tournament ID']?.startsWith('GAP') || p['ID']?.startsWith('GAP'));
      const groupB = standings.filter((p: any) => p['Tournament ID']?.startsWith('GBP') || p['ID']?.startsWith('GBP'));
      
      return {
        groups: [
          { name: 'Group A', players: groupA.sort((a: any, b: any) => getPoints(b) - getPoints(a)) },
          { name: 'Group B', players: groupB.sort((a: any, b: any) => getPoints(b) - getPoints(a)) }
        ]
      };
    } 
    
    else if (category === 'Juniors') {
      // Needs logic for 3 groups. Assuming prefixes or grouping logic.
      // IF prefixes aren't clear, we might need a specific 'Group' column in the CSV? 
      // For now, I'll attempt a generic split or look for a Group column.
      // FALLBACK: If no explicit ID logic, maybe split by row count or look for a "Group" header?
      // Let's try finding unique ID prefixes if possible, or just dump them all if structure is unclear.
      // IMPROVEMENT: Check if there is a 'Group' column in your CSV.
      
      // Attempting to split by ID prefix assuming standard naming
      const groups: any = {};
      standings.forEach((p: any) => {
          const id = p['Tournament ID'] || p['ID'];
          if(id) {
              const prefix = id.replace(/[0-9]/g, ''); // Get letters e.g., 'GAP'
              if(!groups[prefix]) groups[prefix] = [];
              groups[prefix].push(p);
          }
      });
      
      // Convert to array
      const groupArray = Object.keys(groups).map(key => ({
          name: `Group ${key}`, 
          players: groups[key].sort((a: any, b: any) => getPoints(b) - getPoints(a))
      }));

      return { groups: groupArray };
    } 
    
    else if (category === 'Kids') {
       // Single Group
       const sorted = standings.sort((a: any, b: any) => getPoints(b) - getPoints(a));
       return { 
           groups: [{ name: 'League Table', players: sorted }] 
       };
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-400">
            ⚔️ Tournament Progress: {activeTab}
          </h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-sm font-bold">
            ← Home
          </a>
        </div>

        {/* TABS */}
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
               <span className="text-2xl mb-2">📊</span>
               Building Bracket...
             </div>
        )}

        {/* CONTENT */}
        {!loading && data && (
            <div className="space-y-12">
                
                {/* 1. GROUPS SECTION */}
                <div className={`grid gap-8 ${data.groups.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                    {data.groups.map((group: any, idx: number) => (
                        <div key={idx} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
                            <h2 className="text-lg font-bold text-white mb-4 border-b border-slate-700 pb-2 flex justify-between">
                                <span>{group.name}</span>
                                <span className="text-xs font-normal text-slate-500 bg-slate-950 px-2 py-1 rounded">Top 2 Qualify</span>
                            </h2>
                            <div className="space-y-2">
                                {group.players.map((p: any, i: number) => (
                                    <div key={i} className={`flex justify-between items-center p-2 rounded ${i < 2 ? 'bg-green-900/20 border border-green-900/50' : 'bg-slate-950/50'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-mono text-xs w-5 ${i < 2 ? 'text-green-400 font-bold' : 'text-slate-500'}`}>{i + 1}.</span>
                                            <span className={`text-sm ${i < 2 ? 'text-green-200' : 'text-slate-400'}`}>
                                                {p['Nickname'] || p['Player Name'] || p['Name']}
                                            </span>
                                        </div>
                                        <span className="font-bold text-sm text-slate-300">{p['Points'] || p['Pts'] || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. KNOCKOUT BRACKET SECTION */}
                {/* This visualizes the path for qualifiers */}
                <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 text-center">
                    <h2 className="text-2xl font-bold text-white mb-8">🏆 Knockout Stage</h2>
                    
                    {/* ADULTS BRACKET (2 Groups -> Semis -> Final) */}
                    {activeTab === 'Adults' && (
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                            
                            {/* SEMI FINALS */}
                            <div className="space-y-12">
                                <div className="border border-slate-600 rounded-lg p-4 bg-slate-800 w-48 relative">
                                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Semi-Final 1</div>
                                    <div className="font-bold text-green-400 mb-1">A1: {data.groups[0]?.players[0]?.['Nickname'] || 'TBD'}</div>
                                    <div className="text-xs text-slate-500">vs</div>
                                    <div className="font-bold text-blue-400 mt-1">B2: {data.groups[1]?.players[1]?.['Nickname'] || 'TBD'}</div>
                                    {/* Line to Final */}
                                    <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-slate-600"></div>
                                    <div className="hidden md:block absolute top-1/2 -right-8 w-0.5 h-20 bg-slate-600 origin-top"></div> 
                                </div>

                                <div className="border border-slate-600 rounded-lg p-4 bg-slate-800 w-48 relative">
                                    <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Semi-Final 2</div>
                                    <div className="font-bold text-blue-400 mb-1">B1: {data.groups[1]?.players[0]?.['Nickname'] || 'TBD'}</div>
                                    <div className="text-xs text-slate-500">vs</div>
                                    <div className="font-bold text-green-400 mt-1">A2: {data.groups[0]?.players[1]?.['Nickname'] || 'TBD'}</div>
                                     {/* Line to Final */}
                                     <div className="hidden md:block absolute top-1/2 -right-8 w-8 h-0.5 bg-slate-600"></div>
                                     <div className="hidden md:block absolute bottom-1/2 -right-8 w-0.5 h-20 bg-slate-600 origin-bottom"></div>
                                </div>
                            </div>

                            {/* GRAND FINAL */}
                            <div className="border-2 border-amber-500 rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 w-56 shadow-2xl relative z-10">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-xs font-black uppercase">Grand Final</div>
                                <div className="text-lg font-bold text-white mb-2">Winner SF1</div>
                                <div className="text-sm text-slate-500">vs</div>
                                <div className="text-lg font-bold text-white mt-2">Winner SF2</div>
                            </div>

                        </div>
                    )}

                    {/* KIDS BRACKET (Top 4 -> Semis -> Final) */}
                     {activeTab === 'Kids' && (
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                            
                             <div className="space-y-12">
                                <div className="border border-slate-600 rounded-lg p-4 bg-slate-800 w-48 relative">
                                    <div className="text-xs text-slate-500 mb-2">SF 1</div>
                                    <div className="font-bold text-green-400">1st: {data.groups[0]?.players[0]?.['Nickname'] || 'TBD'}</div>
                                    <div className="text-xs text-slate-500 my-1">vs</div>
                                    <div className="font-bold text-white">4th: {data.groups[0]?.players[3]?.['Nickname'] || 'TBD'}</div>
                                </div>

                                <div className="border border-slate-600 rounded-lg p-4 bg-slate-800 w-48 relative">
                                    <div className="text-xs text-slate-500 mb-2">SF 2</div>
                                    <div className="font-bold text-green-400">2nd: {data.groups[0]?.players[1]?.['Nickname'] || 'TBD'}</div>
                                    <div className="text-xs text-slate-500 my-1">vs</div>
                                    <div className="font-bold text-white">3rd: {data.groups[0]?.players[2]?.['Nickname'] || 'TBD'}</div>
                                </div>
                            </div>

                            {/* GRAND FINAL */}
                            <div className="border-2 border-amber-500 rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 w-56 shadow-2xl">
                                <div className="text-xs text-amber-500 font-bold mb-2">CHAMPIONSHIP</div>
                                <div className="text-lg font-bold text-white">Winner SF1</div>
                                <div className="text-sm text-slate-500 my-1">vs</div>
                                <div className="text-lg font-bold text-white">Winner SF2</div>
                            </div>
                        </div>
                     )}
                     
                     {/* JUNIORS NOTE */}
                     {activeTab === 'Juniors' && (
                         <div className="text-center">
                             <div className="inline-block bg-slate-800 px-6 py-3 rounded-xl border border-slate-600">
                                 <span className="text-2xl block mb-2">➡️</span>
                                 <h3 className="font-bold text-white">Super Six Stage</h3>
                                 <p className="text-sm text-slate-400 mt-1">Top 2 from each of the 3 groups advance to a final round-robin league.</p>
                             </div>
                         </div>
                     )}

                </div>
            </div>
        )}

      </div>
    </main>
  );
}