export default function Procedure() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">♟️ LiChess Procedure</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white">← Home</a>
        </div>

        <div className="space-y-6 text-slate-300 leading-relaxed">
          
          <div className="bg-slate-900/50 p-4 rounded-lg border-l-4 border-blue-500">
            <strong>Important:</strong> You must have a valid LiChess account created at least 24 hours before the match.
          </div>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">Step 1: Challenge Link</h2>
            <p>
              PASTE YOUR TEXT FROM WORD DOC HERE. 
              (Example: The white player must send the challenge link...)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-2">Step 2: Game Settings</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Variant:</strong> Standard</li>
              <li><strong>Time Control:</strong> 10 Minutes</li>
              <li><strong>Increment:</strong> 5 Seconds</li>
              <li><strong>Rated:</strong> Yes</li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  );
}