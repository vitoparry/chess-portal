"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const pathname = usePathname();

  // Don't show on Landing Page
  if (pathname === '/') return null;

  const links = [
    { href: '/', label: 'Home' },
    { href: '/live', label: "Today's Matches" },
    { href: '/standings', label: 'Standings' },
    { href: '/groups', label: 'Rounds' },
    { href: '/rules', label: 'Rules' },
    { href: '/procedure', label: 'Guide' },
    { href: '/archive', label: 'Archive' },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-40 overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-center md:justify-end gap-2 min-w-max">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <button className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                isActive 
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}>
                {link.label}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}