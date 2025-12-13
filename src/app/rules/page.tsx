export default function Rules() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-500">📜 Tournament Rules</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition">← Back Home</a>
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

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Qualification to Knockouts</h2>
            <ul className="space-y-2 list-disc pl-5 marker:text-purple-500">
              <li>The <strong>top two players</strong> from each group (A and B) qualify for the knockout stage.</li>
              <li>Group ranking is based on total points scored in the round-robin games.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Tie-Break Rules</h2>
            <div className="bg-slate-900/30 p-4 rounded-lg">
                <p className="mb-2 italic text-slate-400">If two or more players are tied for any qualifying position:</p>
                <ul className="space-y-2 list-disc pl-5 marker:text-red-500">
                <li>The tied players will play <strong>5-minute blitz games</strong>.</li>
                <li>If more than two players are tied, a suitable mini play-off (round-robin or knockout) will be decided by the Arbiter.</li>
                <li>Blitz games continue until a clear ranking is achieved.</li>
                <li><strong>Colors:</strong> Decided by lot for the first game, then alternating.</li>
                </ul>
            </div>
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
      </div>
    </main>
  );
}