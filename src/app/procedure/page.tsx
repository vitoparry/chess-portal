export default function Procedure() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">♟️ LiChess Procedure</h1>
          <a href="/" className="text-sm text-slate-400 hover:text-white transition">← Back Home</a>
        </div>

        <div className="space-y-12 text-slate-300 leading-relaxed">
          
          {/* STEP 1 */}
          <section className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Play with a friend
              </h2>
              <p className="mb-4">
                Go to <a href="https://lichess.org" target="_blank" className="text-blue-400 underline">lichess.org</a>. On the right side of the screen, click the button labeled <strong>"Play with a friend"</strong>.
              </p>
            </div>
            {/* Visual Aid: Mock Button */}
            <div className="w-full md:w-1/3 bg-slate-900 p-6 rounded-xl border border-slate-700 flex items-center justify-center">
              <div className="bg-slate-700 px-6 py-3 rounded text-slate-200 font-bold border-b-4 border-slate-600 shadow-lg">
                🤝 Play with a friend
              </div>
            </div>
          </section>

          {/* STEP 2 */}
          <section className="flex flex-col md:flex-row gap-8 items-start border-t border-slate-700 pt-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Configure Time Control
              </h2>
              <p className="mb-4">
                Set the game options exactly as shown. It is critical to select <strong>"Real time"</strong>.
              </p>
              <ul className="list-disc pl-10 space-y-2 text-slate-400">
                <li>Variant: <span className="text-white font-bold">Standard</span></li>
                <li>Time control: <span className="text-white font-bold">Real time</span></li>
                <li>Minutes per side: <span className="text-amber-400 font-bold">20</span></li>
                <li>Increment in seconds: <span className="text-amber-400 font-bold">10</span></li>
              </ul>
            </div>
            
            {/* Visual Aid: UI Replica */}
            <div className="w-full md:w-1/3 bg-slate-200 text-slate-800 p-4 rounded-lg shadow-xl font-sans text-sm">
                <div className="flex justify-between items-center mb-2 border-b border-slate-300 pb-2">
                    <span className="font-bold text-slate-500">Variant</span>
                    <span className="font-bold">Standard</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-slate-500">Time control</span>
                    <span className="font-bold">Real time</span>
                </div>
                
                {/* Sliders */}
                <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Minutes per side</span>
                    <span>20</span>
                </div>
                <div className="h-2 bg-slate-300 rounded-full mb-3">
                    <div className="h-full w-1/2 bg-green-600 rounded-full"></div>
                </div>

                <div className="mb-1 flex justify-between text-xs font-bold">
                    <span>Increment in seconds</span>
                    <span>10</span>
                </div>
                <div className="h-2 bg-slate-300 rounded-full mb-4">
                    <div className="h-full w-1/4 bg-green-600 rounded-full"></div>
                </div>

                <div className="flex gap-2 justify-center mt-2">
                     <div className="p-2 bg-white border border-slate-300 rounded shadow-sm">♔</div>
                     <div className="p-2 bg-slate-800 text-white border border-slate-800 rounded shadow-sm">♚</div>
                </div>
            </div>
          </section>

          {/* STEP 3 */}
          <section className="flex flex-col md:flex-row gap-8 items-start border-t border-slate-700 pt-8">
             <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Send the Challenge
              </h2>
              <p className="mb-4">
                Click the <span className="text-2xl">♔</span> King (White) or <span className="text-2xl">♚</span> King (Black) icon to generate the link.
              </p>
              <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg text-blue-200 text-sm">
                 <strong>Note:</strong> Copy the URL provided and send it to your opponent via WhatsApp or Discord.
              </div>
            </div>

            {/* Visual Aid: Link Box */}
            <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-xl text-center">
                <div className="text-green-600 text-6xl mb-2">🐢</div>
                <div className="text-slate-500 text-lg font-light mb-4">Rapid <span className="font-bold text-slate-800">20+10</span></div>
                
                <div className="bg-slate-100 p-2 rounded border border-slate-300 flex items-center gap-2 text-xs text-slate-500 overflow-hidden">
                    <span className="truncate">https://lichess.org/qWuJ9gMt9</span>
                    <button className="bg-blue-500 text-white px-2 py-1 rounded">Copy</button>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">The first person to come to this URL will play with you.</div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}