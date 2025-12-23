"use client";
import React from 'react';

interface MatchProps {
  match: any;
  showScore?: boolean;
}

// 🧱 ISOLATED BOARD COMPONENT
// This specific component is "Stubborn". It will ONLY re-render if the gameId changes.
// It ignores all other updates (like score changes, timestamps, etc.), keeping the connection alive.
const LichessBoard = React.memo(({ gameId }: { gameId: string }) => {
  return (
    <iframe 
      // 🚀 CRITICAL FIX: autoplay=1 forces the game to play live moves!
      // clock=1 shows the timer, which is great for live viewing
      src={`https://lichess.org/embed/${gameId}?theme=auto&bg=dark&autoplay=1&clock=1`}
      className="absolute inset-0 w-full h-full z-10"
      frameBorder="0"
      allowFullScreen
      style={{ pointerEvents: 'auto' }} // Explicitly allow interaction (clicks)
    ></iframe>
  );
}, (prev, next) => prev.gameId === next.gameId);


// 🧠 MAIN CARD COMPONENT
const MatchCardComponent = ({ match, showScore }: MatchProps) => {
  
  const getGameId = (url: string) => {
    const idMatch = url?.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/);
    return idMatch ? idMatch[1] : null;
  };

  const gameId = match.lichess_url ? getGameId(match.lichess_url) : null;

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700 flex flex-col h-full hover:border-slate-600 transition-colors">
      
      {/* HEADER: Updateable Info */}
      <div className="bg-slate-900/50 p-3 flex justify-between items-center border-b border-slate-700">
        
        {/* White Player */}
        <div className={`flex flex-col min-w-0 flex-1 ${match.result && match.result.startsWith('1') ? 'text-green-400' : 'text-slate-200'}`}>
            <span className="font-bold text-sm md:text-base truncate">
              {match.white_display_name || match.white_name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono truncate">@{match.white_name}</span>
        </div>

        {/* Center Badge */}
        <div className="px-2 text-center min-w-[60px]">
           {showScore && match.result ? (
             <div className="text-sm font-black font-mono text-amber-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
               {match.result}
             </div>
           ) : (
             <div className="bg-slate-950 px-2 py-1 rounded text-[10px] text-slate-500 border border-slate-800 font-bold">VS</div>
           )}
        </div>

        {/* Black Player */}
        <div className={`flex flex-col items-end min-w-0 flex-1 text-right ${match.result && match.result.endsWith('1') ? 'text-green-400' : 'text-slate-200'}`}>
            <span className="font-bold text-sm md:text-base truncate">
              {match.black_display_name || match.black_name}
            </span>
            <span className="text-[10px] text-slate-500 font-mono truncate">@{match.black_name}</span>
        </div>
      </div>

      {/* BOARD AREA */}
      <div className="relative w-full aspect-square md:aspect-video lg:aspect-[4/3] bg-slate-950 z-0">
        {gameId ? (
          // Usage of the Isolated Component
          <LichessBoard gameId={gameId} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 z-10">
             <span className="text-4xl mb-2">📅</span>
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scheduled</div>
             <div className="text-sm font-bold text-amber-500 mt-1">
                {match.start_time ? new Date(match.start_time).toLocaleString([], { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Time TBD'}
             </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      {match.lichess_url && (
        <a 
          href={match.lichess_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-900/80 text-center py-2 text-[10px] font-bold text-slate-500 hover:text-white hover:bg-slate-800 transition uppercase tracking-widest border-t border-slate-700 block z-20"
        >
          Open in Lichess ↗
        </a>
      )}
    </div>
  );
};

// 🛡️ RE-RENDER GUARD: Only update if these specific values change
const MatchCard = React.memo(MatchCardComponent, (prev, next) => {
    return (
        prev.match.id === next.match.id &&
        prev.match.lichess_url === next.match.lichess_url &&
        prev.match.white_display_name === next.match.white_display_name &&
        prev.match.black_display_name === next.match.black_display_name &&
        prev.match.result === next.match.result &&
        prev.match.start_time === next.match.start_time
    );
});

export default MatchCard;