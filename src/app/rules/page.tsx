"use client";
import { useState } from 'react';

export default function Rules() {
  const [activeTab, setActiveTab] = useState('Adults');

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-amber-500">📜 Tournament Rules</h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition font-bold text-sm">
            ← Home
          </a>
        </div>

        {/* 🎛️ CATEGORY TABS */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-900 p-1 rounded-xl inline-flex shadow-inner border border-slate-700">
            {['Adults', 'Juniors', 'Kids'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT SWITCHER */}
        <div className="space-y-8 text-slate-300 leading-relaxed min-h-[400px]">
          
          {/* --- ADULTS RULES --- */}
          {activeTab === 'Adults' && (
            <div className="animate-in fade-in duration-500">
              <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700 mb-6">
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-amber-500 pl-3">Adults Format</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-amber-500">
                  <li><strong>Format:</strong> Round Robin Group Stage followed by Knockouts.</li>
                  <li><strong>Time Control:</strong> 20 minutes + 10 seconds increment.</li>
                  <li><strong>Scoring:</strong> Win (1), Draw (0.5), Loss (0).</li>
                </ul>
              </section>

              <section className="mb-6">
                <h2 className="text-xl font-bold text-white mb-3">Knockouts & Grand Final</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-purple-500">
                  <li>Top 2 players from each pool qualify.</li>
                  <li><strong>Grand Final:</strong> 4-game series (2 Standard, 2 Blitz).</li>
                  <li><strong>Tie-Breaks:</strong> Blitz games (5 mins) until a winner is decided.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-white mb-3">General</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-green-500">
                  <li>Played on Lichess.org.</li>
                  <li>White pieces sends the challenge link.</li>
                </ul>
              </section>
            </div>
          )}

          {/* --- JUNIORS RULES --- */}
          {activeTab === 'Juniors' && (
            <div className="animate-in fade-in duration-500">
              <section className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30 mb-6">
                 <h2 className="text-xl font-bold text-blue-400 mb-4 border-l-4 border-blue-500 pl-3">Juniors Format</h2>
                 
                 <div className="mb-6">
                    <h3 className="font-bold text-white text-lg mb-2">Phase 1: Group Stage</h3>
                    <ul className="space-y-2 list-disc pl-5 marker:text-blue-500 text-sm">
                        <li>3 Groups.</li>
                        <li>Round-robin within each group.</li>
                        <li>All players get one <strong>bye</strong>.</li>
                        <li>Each player plays 6 games + 1 bye.</li>
                        <li><strong>Top 2</strong> from each group advance to Phase 2.</li>
                    </ul>
                 </div>

                 <div className="mb-6">
                    <h3 className="font-bold text-white text-lg mb-2">Phase 2: Super Six</h3>
                    <ul className="space-y-2 list-disc pl-5 marker:text-purple-500 text-sm">
                        <li>The 6 qualified players compete in a round-robin format.</li>
                        <li><strong>Top 2</strong> players from the Super Six qualify for the finals.</li>
                    </ul>
                 </div>

                 <div>
                    <h3 className="font-bold text-white text-lg mb-2">🏆 Finals</h3>
                    <ul className="space-y-2 list-disc pl-5 marker:text-amber-500 text-sm">
                        <li>Top 2 players from the Super Six play for the Title.</li>
                    </ul>
                 </div>
              </section>
            </div>
          )}

          {/* --- KIDS RULES (WIP) --- */}
          {activeTab === 'Kids' && (
            <div className="animate-in fade-in duration-500 flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-700 rounded-xl">
              <span className="text-5xl mb-4">🚧</span>
              <h2 className="text-2xl font-bold text-slate-400">Rules Coming Soon</h2>
              <p className="text-slate-500 mt-2">The format for the Kids category is being finalized.</p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}