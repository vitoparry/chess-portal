"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

export default function Groups() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔴 IMPORTANT: PASTE YOUR TAB 5 (GROUP STAGE) LINK BELOW 🔴
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbb6WXo-IHbkVv8rccue4nFi2TnSDpRJzbf1Q1N9ZGhLV7F5afTL0MqZgbyOK4s6wvfnGVNm5_5pIM/pub?gid=237055020&single=true&output=csv';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_URL);
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
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-400">
            ⚔️ Group Stage Rounds
          </h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
            ← Home
          </a>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-slate-500 animate-pulse">Loading Round Data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-sm tracking-wider">
                    {headers.map((header, index) => (
                      <th key={index} className="p-4 font-semibold border-b border-slate-700 whitespace-nowrap">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-700/50 transition">
                      {headers.map((header, colIndex) => (
                        <td key={colIndex} className="p-4 text-slate-200 whitespace-nowrap">
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