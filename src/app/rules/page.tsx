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
          
          {/* --- ADULTS RULES (Full Detailed Version) --- */}
          {activeTab === 'Adults' && (
            <div className="animate-in fade-in duration-500 space-y-8">
              
              {/* Section 1 */}
              <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-4 border-l-4 border-amber-500 pl-3">
                  Tournament Overview
                </h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-amber-500">
                  <li><strong>Event:</strong> Chess Championship 2025-26</li>
                  <li><strong>Category:</strong> Adults</li>
                  <li><strong>Players:</strong> 16 Participants</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3">Group Stage (Round Robin)</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-blue-500">
                  <li>Each player in a group plays one game against every other player in the opposite group.</li>
                  <li><strong>Time Control:</strong> 20 minutes + 10 seconds increment.</li>
                  <li><strong>Scoring System:</strong>
                    <ul className="list-disc pl-5 mt-1 text-slate-400">
                      <li>Win: <span className="text-green-400 font-bold">1 point</span></li>
                      <li>Draw: <span className="text-yellow-400 font-bold">0.5 points</span></li>
                      <li>Loss: <span className="text-red-400 font-bold">0 points</span></li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* Section 3: Knockouts */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3">Knockout Stage</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-purple-500">
                  <li>The <strong>top two players</strong> from each pool qualify for the knockout stage.</li>
                  <li>These four players form the bracket (Semifinals & Final).</li>
                  <li><strong>Tie-Breaks in Groups:</strong> If there is a tie for a qualifying spot:
                     <ul className="list-disc pl-5 mt-2 text-slate-400">
                        <li>5-minute blitz games are played between tied players.</li>
                        <li>Blitz games are repeated until a winner is decided.</li>
                        <li>Colors for the first blitz game are decided by lot, then alternating.</li>
                     </ul>
                  </li>
                </ul>
              </section>

              {/* Section 4: Grand Final */}
              <section className="bg-amber-900/20 p-6 rounded-xl border border-amber-700/50">
                <h2 className="text-xl font-bold text-amber-500 mb-3">🏆 The Grand Final</h2>
                <p className="mb-4">The top two winners of the knockout table play a <strong>4-game Grand Final</strong>.</p>
                
                <h3 className="font-bold text-white mb-2">Game Format:</h3>
                <ul className="space-y-2 list-decimal pl-5 marker:text-amber-500 text-slate-200">
                    <li><strong>2 Games:</strong> Standard (20 mins + 10 sec).</li>
                    <li><strong>2 Games:</strong> Blitz (5 mins).</li>
                </ul>

                <h3 className="font-bold text-white mt-4 mb-2">Tie-Breaker (If tied after 4 games):</h3>
                <ul className="space-y-2 list-disc pl-5 marker:text-red-500 text-slate-300">
                    <li>Two additional 5-minute blitz games are played.</li>
                    <li>If still tied, additional pairs of 5-minute blitz games are played until a winner is decided.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-bold text-white mb-3">General Regulations</h2>
                <ul className="space-y-2 list-disc pl-5 marker:text-green-500">
                  <li>All games must be played on <strong>lichess.org</strong>.</li>
                  <li>All games are played according to current FIDE Laws of Chess.</li>
                  <li><strong>White Pieces:</strong> The player with White must send the link to their opponent.</li>
                  <li>Any disputes not covered here will be decided by the Arbiter (Final Decision).</li>
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