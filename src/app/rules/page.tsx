export default function Rules() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-amber-500">📜 Tournament Rules</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white">← Home</a>
        </div>

        {/* CONTENT AREA: Paste your rules text below inside the <p> tags */}
        <div className="space-y-6 text-slate-300 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-2">1. General Guidelines</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>PASTE YOUR RULE 1 HERE</li>
              <li>PASTE YOUR RULE 2 HERE</li>
              <li>Fair play is mandatory. Any use of engines results in immediate disqualification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">2. Match Format</h2>
            <p>
              PASTE YOUR TEXT HERE. Example: Matches are 10+5 Rapid format. 
              Players must be present in the voice channel 5 minutes before start.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">3. Disconnection Policy</h2>
            <p>
              PASTE YOUR TEXT HERE.
            </p>
          </section>

        </div>

      </div>
    </main>
  );
}