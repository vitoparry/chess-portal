"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// 📊 CONFIG: DATA SOURCES
const DATA_SOURCES = [
  { 
    category: 'Adults', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=535970026&single=true&output=csv',
  },
  { 
    category: 'Juniors', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSugPx6ejmoqQGvkXMVZ2IC-5NKuKFuhrBkEFjSRr-lZbY1aQIfW0tQXllF6cSGNIHL7TXgklGosGZ6/pub?gid=45823858&single=true&output=csv',
  },
  { 
    category: 'Kids', 
    standings: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOj-HR4exbW-YvxAjDSe_l83xGXNbty52DoFhJQQqk7U97KVtKnh9F2QcG1Dn9z3hK9C6eGKqJA9ln/pub?gid=130837965&single=true&output=csv',
  }
];

export default function Standings() {
  const [activeTab, setActiveTab] = useState('Adults');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null); // For Visuals
  const [rawHeaders, setRawHeaders] = useState<string[]>([]); // For Table
  const [rawData, setRawData] = useState<any[]>([]); // For Table

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const source = DATA_SOURCES.find(s => s.category === activeTab);
      if (!source) return;

      try {
        const response = await fetch(source.standings);
        const csvText = await response.text();
        
        // 1. Parse for Table View (Raw Data)
        // transformHeader trims spaces to avoid "Tournament ID " mismatch
        const tableParsed = Papa.parse(csvText, { 
            header: true, 
            skipEmptyLines: true,
            transformHeader: (h) => h.trim() 
        });
        setRawHeaders(tableParsed.meta.fields || []);
        setRawData(tableParsed.data);

        // 2. Parse for Visuals (Processed Data)
        const processed = processVisualData(activeTab, tableParsed.data);
        setData(processed);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const processVisualData = (category: string, rows: any[]) => {
    // 🧠 HELPER: Find the "Points" column robustly
    const getPoints = (p: any) => {
        // Direct check
        let val = p['Points'] || p['Pts'] || p['Total'] || p['Score'];
        if (val) return parseFloat(val);
        // Fuzzy search through keys
        for (const key in p) {
            if (key.toLowerCase().includes('point') || key.toLowerCase().includes('score') || key.toLowerCase().includes('pts')) {
                 const num = parseFloat(p[key]);
                 if (!isNaN(num)) return num;
            }
        }
        return 0;
    };

    // 🧠 HELPER: Find the "ID" column robustly
    const getId = (p: any) => {
        let val = p['Tournament ID'] || p['ID'] || p['Code'];
        if (val) return val.toString().toUpperCase();
        
        // Fuzzy search
        for (const key in p) {
            if (key.toLowerCase().includes('tournament') || key.toLowerCase().includes('id')) {
                 return p[key]?.toString().toUpperCase() || '';
            }
        }
        return '';
    };

    // 🧠 HELPER: Find Name
    const getName = (p: any) => p['Nickname'] || p['Player Name'] || p['Name'] || 'Unknown';

    if (category === 'Adults') {
      // Filter by ID prefix using the robust ID finder
      const groupA = rows.filter((p: any) => getId(p).includes('GAP'));
      const groupB = rows.filter((p: any) => getId(p).includes('GBP'));
      
      return {
        groups: [
          { name: 'Group A', players: groupA.sort((a: any, b: any) => getPoints(b) - getPoints(a)) },
          { name: 'Group B', players: groupB.sort((a: any, b: any) => getPoints(b) - getPoints(a)) }
        ]
      };
    } 
    else if (category === 'Juniors') {
      const groups: any = {};
      rows.forEach((p: any) => {
          const id = getId(p);
          if(id) {
              // Extract letters (e.g. GCP -> GCP) or assume standard prefix
              // If ID is GCP1, prefix is GCP.
              const prefix = id.replace(/[0-9]/g, ''); 
              if(prefix) {
                  if(!groups[prefix]) groups[prefix] = [];
                  groups[prefix].push(p);
              }
          }
      });
      const groupArray = Object.keys(groups).map(key => ({
          name: `Group ${key}`, 
          players: groups[key].sort((a: any, b: any) => getPoints(b) - getPoints(a))
      }));
      return { groups: groupArray };
    } 
    else if (category === 'Kids') {
       const sorted = [...rows].sort((a: any, b: any) => getPoints(b) - getPoints(a));
       return { 
           groups: [{ name: 'League Table', players: sorted }] 
       };
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
            🏆 Championship Standings
          </h1>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 p-1.5 rounded-2xl inline-flex shadow-xl border border-slate-700/50 backdrop-blur-sm">
            {['Adults', 'Juniors', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/20 scale-105' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="text-center py-12 animate-pulse text-slate-500">Loading Data...</div>}

        {!loading && data && (
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* --- 1. VISUALIZATION SECTION --- */}
                
                {/* 🔷 ADULTS: Enhanced Visuals */}
                {activeTab === 'Adults' && (
                    <div className="grid lg:grid-cols-12 gap-8">
                         {/* Group Tables (Left) */}
                         <div className="lg:col-span-5 space-y-6">
                            {data.groups.map((group: any, idx: number) => (
                                <div key={idx} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 backdrop-blur-sm">
                                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                        <h3 className="text-base font-bold text-slate-200">{group.name}</h3>
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Top 2 Qualify</span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.players.slice(0, 4).map((p: any, i: number) => (
                                            <div key={i} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${
                                                i === 0 ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' :
                                                i === 1 ? 'bg-slate-700/30 border-slate-600/50 text-slate-200' :
                                                'bg-transparent border-transparent text-slate-500'
                                            }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-black text-xs w-5 h-5 flex items-center justify-center rounded-full ${
                                                        i === 0 ? 'bg-amber-500 text-slate-900' : 
                                                        i === 1 ? 'bg-slate-600 text-white' : 'bg-slate-800'
                                                    }`}>{i+1}</span>
                                                    <span className="font-medium text-sm">{p['Nickname'] || p['Player Name']}</span>
                                                </div>
                                                <span className="font-mono font-bold text-sm">{p['Points'] || p['Pts']}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                         
                         {/* Knockout Bracket (Right) */}
                         <div className="lg:col-span-7 bg-slate-800/50 p-8 rounded-2xl border border-slate-700 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                             
                             <h3 className="text-xl font-black text-white mb-10 text-center uppercase tracking-widest flex items-center justify-center gap-3">
                                 <span className="text-amber-500 text-2xl">👑</span> Championship Path
                             </h3>
                             
                             <div className="flex items-center justify-center gap-6 text-xs">
                                 {/* Semis Column */}
                                 <div className="flex flex-col gap-12 w-40">
                                     <div className="relative bg-slate-900 p-3 rounded-lg border border-slate-600 shadow-lg">
                                         <div className="text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Semi-Final 1</div>
                                         <div className="font-bold text-green-400 border-b border-slate-800 pb-1 mb-1">{data.groups[0]?.players[0]?.['Nickname'] || 'A1 (TBD)'}</div>
                                         <div className="font-bold text-blue-400">{data.groups[1]?.players[1]?.['Nickname'] || 'B2 (TBD)'}</div>
                                         {/* Connector */}
                                         <div className="hidden md:block absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-600"></div>
                                         <div className="hidden md:block absolute top-1/2 -right-6 w-0.5 h-16 bg-slate-600 origin-top"></div>
                                     </div>

                                     <div className="relative bg-slate-900 p-3 rounded-lg border border-slate-600 shadow-lg">
                                         <div className="text-slate-500 mb-1 uppercase tracking-wider text-[10px]">Semi-Final 2</div>
                                         <div className="font-bold text-blue-400 border-b border-slate-800 pb-1 mb-1">{data.groups[1]?.players[0]?.['Nickname'] || 'B1 (TBD)'}</div>
                                         <div className="font-bold text-green-400">{data.groups[0]?.players[1]?.['Nickname'] || 'A2 (TBD)'}</div>
                                         {/* Connector */}
                                         <div className="hidden md:block absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-600"></div>
                                         <div className="hidden md:block absolute bottom-1/2 -right-6 w-0.5 h-16 bg-slate-600 origin-bottom"></div>
                                     </div>
                                 </div>

                                 {/* Final Column */}
                                 <div className="w-40">
                                     <div className="bg-gradient-to-b from-amber-900/40 to-slate-900 p-4 rounded-xl border border-amber-500/50 text-center shadow-2xl">
                                         <div className="text-amber-500 font-black mb-2 uppercase tracking-widest text-[10px]">Grand Final</div>
                                         <div className="text-white font-bold py-1">Winner SF1</div>
                                         <div className="text-slate-500 text-[10px]">vs</div>
                                         <div className="text-white font-bold py-1">Winner SF2</div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                )}

                {/* 🟩 KIDS: Privacy Mode (Hidden Names in Bracket) */}
                {activeTab === 'Kids' && (
                    <div className="grid md:grid-cols-2 gap-8">
                         {/* LEFT: Points Table (Visible for Progress) */}
                         <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                             <h3 className="text-lg font-bold text-green-400 mb-4">League Table</h3>
                             <div className="space-y-2">
                                {data.groups[0]?.players.slice(0, 8).map((p: any, i: number) => (
                                    <div key={i} className={`flex justify-between items-center p-3 rounded-lg border ${i<4 ? 'bg-green-900/10 border-green-500/20' : 'bg-slate-950/30 border-transparent'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`font-mono font-bold w-6 ${i<4 ? 'text-green-400' : 'text-slate-600'}`}>{i+1}</span>
                                            <span className="text-slate-200 text-sm">{p['Nickname'] || p['Player Name']}</span>
                                        </div>
                                        <span className="font-bold text-slate-300 font-mono">{p['Points'] || p['Total'] || 0}</span>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-6 text-xs text-slate-500 text-center border-t border-slate-800 pt-4">* Top 4 qualify for Semis</div>
                         </div>

                         {/* RIGHT: Bracket (Names HIDDEN until league over) */}
                         <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 flex flex-col justify-center items-center text-center">
                             <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center text-3xl mb-4">🔒</div>
                             <h3 className="text-xl font-bold text-white mb-2">Knockout Stage</h3>
                             <p className="text-slate-400 text-sm mb-8 max-w-xs">Matchups will be revealed after the league stage concludes.</p>
                             
                             <div className="w-full max-w-xs space-y-4 opacity-50 grayscale">
                                 <div className="bg-slate-900 p-4 rounded-lg border border-dashed border-slate-600">
                                     <div className="flex justify-between text-sm font-bold text-slate-500">
                                         <span>League #1</span>
                                         <span>vs</span>
                                         <span>League #4</span>
                                     </div>
                                 </div>
                                 <div className="bg-slate-900 p-4 rounded-lg border border-dashed border-slate-600">
                                     <div className="flex justify-between text-sm font-bold text-slate-500">
                                         <span>League #2</span>
                                         <span>vs</span>
                                         <span>League #3</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                )}
                
                {/* 🟦 JUNIORS: Standard View */}
                {activeTab === 'Juniors' && (
                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            {data.groups.map((group: any, idx: number) => (
                                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
                                    <div className="text-blue-400 font-bold text-sm mb-4 uppercase tracking-wider">{group.name}</div>
                                    <div className="space-y-2">
                                        {group.players.slice(0, 3).map((p:any, i:number) => (
                                            <div key={i} className="text-xs flex justify-between items-center text-slate-300 py-1">
                                                <div className="flex gap-2">
                                                    <span className="text-slate-600 font-mono">{i+1}.</span>
                                                    <span>{p['Nickname']}</span>
                                                </div>
                                                <span className="font-mono text-white bg-slate-800 px-1.5 rounded">{p['Points']}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center">
                             <div className="inline-block bg-blue-900/20 text-blue-300 px-6 py-3 rounded-full text-sm font-bold border border-blue-500/30 shadow-lg">
                                ➡️ Top 2 from each group advance to Super Six
                            </div>
                        </div>
                    </div>
                )}


                {/* --- 2. DETAILED DATA TABLE (BOTTOM) --- */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
                    <div className="bg-slate-950 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Full Standings Table</h3>
                        <a href={DATA_SOURCES.find(s => s.category === activeTab)?.standings} target="_blank" className="text-xs text-slate-500 hover:text-white transition">View Source Sheet ↗</a>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider">
                                    {rawHeaders.map((header, index) => (
                                        <th key={index} className="p-4 font-semibold border-b border-slate-700 whitespace-nowrap">{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {rawData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-slate-700/50 transition">
                                        {rawHeaders.map((header, colIndex) => (
                                            <td key={colIndex} className="p-4 text-slate-200 text-sm whitespace-nowrap">
                                                {colIndex === 0 ? <span className="font-bold text-amber-500">{row[header]}</span> : row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        )}
      </div>
    </main>
  );
}