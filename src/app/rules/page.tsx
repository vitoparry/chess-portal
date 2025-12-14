export default function Rules() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header - Standardized */}
        <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-500">📜 Tournament Rules</h1>
          <a href="/" className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition font-bold text-sm">
            ← Home
          </a>
        </div>

        {/* CONTENT */}
        <div className="space-y-8 text-slate-300 leading-relaxed">
          
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
                <ul className="list-circle pl-5 mt-1 text-slate-400">
                  <li>Win: <span className="text-green-400 font-bold">1 point</span></li>
                  <li>Draw: <span className="text-yellow-400 font-bold">0.5 points</span></li>
                  <li>Loss: <span className="text-red-400 font-bold">0 points</span></li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 3: Knockouts (UPDATED) */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Knockout Stage</h2>
            <ul className="space-y-2 list-disc pl-5 marker:text-purple-500">
              <li>The <strong>top two players</strong> from each pool qualify for the knockout stage.</li>
              <li>These four players form the bracket (Semifinals & Final).</li>
              <li><strong>Tie-Breaks in Groups:</strong> If there is a tie for a qualifying spot:
                 <ul className="list-disc pl-5 mt-2 text-slate-400">
                    <li>5-minute blitz games are played between tied players.</li>
                    <li>Blitz games are repeated until a winner is decided.</li>
                 </ul>
              </li>
            </ul>
          </section>

          {/* Section 4: Grand Final (UPDATED) */}
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
              <li><strong>White Pieces:</strong> The player with White must send the link to their opponent.</li>
              <li>Any disputes not covered here will be decided by the Arbiter (Final Decision).</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}