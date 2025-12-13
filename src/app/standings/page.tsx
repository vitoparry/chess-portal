"use client";
import { useEffect, useState } from 'react';
import Papa from 'papaparse';

export default function Standings() {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // YOUR GOOGLE SHEET LINK
  const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQbb6WXo-IHbkVv8rccue4nFi2TnSDpRJzbf1Q1N9ZGhLV7F5afTL0MqZgbyOK4s6wvfnGVNm5_5pIM/pub?output=csv';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true, // Uses the first row of Excel as headers
          skipEmptyLines: true,
          complete: (results) => {
            setHeaders(results.meta.fields || []);
            setData(results.data);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("Error fetching sheet:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            🏆 Championship Standings
          </h1>
          <div className="flex gap-4">
             <a href="/" className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
                ← Home
             </a>
             <a href={SHEET_URL} className="px-4 py-2 rounded bg-green-900/30 text-green-400 border border-green-900 hover:bg-green-900/50 transition text-sm flex items-center gap-2">
                Download CSV ⬇
             </a>
          </div>
        </div>

        {/* The Table */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">
              Loading data from Google Sheets...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 uppercase text-sm tracking-wider">
                    {headers.map((header, index) => (
                      <th key={index} className="p-4 font-semibold border-b border-slate-700">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-700/50 transition">
                      {headers.map((header, colIndex) => (
                        <td key={colIndex} className="p-4 text-slate-200">
                          {/* Highlight the Rank column (usually 1st) with bold/color */}
                          {colIndex === 0 ? (
                            <span className="font-bold text-amber-500">{row[header]}</span>
                          ) : (
                            row[header]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <p className="mt-4 text-center text-slate-600 text-xs">
          Data is synced live from the Official Tournament Sheet.
        </p>

      </div>
    </main>
  );
}