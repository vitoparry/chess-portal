import Link from 'next/link';
import Image from 'next/image';

export default function Landing() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0"></div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center gap-8 text-center">
        
        {/* The Flyer Image */}
        <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800 hover:scale-[1.02] transition duration-500">
             {/* Note: Next.js looks in 'public' folder automatically */}
            <Image 
              src="/toruneyimage.jpg" 
              alt="Tournament Flyer" 
              fill
              className="object-cover"
              priority
            />
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm">
          CHESS CHAMPIONSHIP
        </h1>

        {/* The Two Buttons */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
          <Link href="/live" className="flex-1 group">
            <button className="w-full py-4 px-8 bg-red-600 hover:bg-red-500 rounded-xl font-black text-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] transition transform group-hover:-translate-y-1">
              🔴 LIVE MATCHES
            </button>
          </Link>
          
          <Link href="/archive" className="flex-1 group">
            <button className="w-full py-4 px-8 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xl border border-slate-600 shadow-xl transition transform group-hover:-translate-y-1 text-slate-300 group-hover:text-white">
              📂 ARCHIVE
            </button>
          </Link>
        </div>

      </div>
    </main>
  );
}