"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

// ⚔️ CONFIG: The 3 CSV Links for Round/Groups
const SHEET_LINKS: Record<string, string> = {
  Adults: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6UFPFARgN12MiEuYpGG2WWAGe0SPlORnm1jeSgoFiXZY7ia4sFXMXAVXalIVn1X8cCK8kFAQ__44k/pub?gid=1586830246&single=true&output=csv',
  Juniors: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSugPx6ejmoqQGvkXMVZ2IC-5NKuKFuhrBkEFjSRr-lZbY1aQIfW0tQXllF6cSGNIHL7TXgklGosGZ6/pub?gid=1273587789&single=true&output=csv',
  Kids: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOj-HR4exbW-YvxAjDSe_l83xGXNbty52DoFhJQQqk7U97KVtKnh9F2QcG1Dn9z3hK9C6eGKqJA9ln/pub?gid=756584123&single=true&output=csv'
};

export default function Groups() {
  const [activeTab, setActiveTab] = useState('Adults');
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_LINKS[activeTab]);
        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true, 
          skipEmptyLines: true,
          complete: (results) => {
            setHeaders(results.meta.fields || []);
            setData(results.data);
            setLoading(false);
          },
        });
      } catch (error) { console.error(error); setLoading(false); }
    };
    fetchData();
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-blue-400">
            ⚔️ Rounds: {activeTab}
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

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-pulse">
               <span className="text-2xl mb-2">⚔️</span>
               Loading {activeTab} Matches...
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider">
                    {headers.map((header, index) => (
                      <th key={index} className="p-4 font-semibold border-b border-slate-700 whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-700/50 transition">
                      {headers.map((header, colIndex) => (
                        <td key={colIndex} className="p-4 text-slate-200 whitespace-nowrap text-sm">
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}