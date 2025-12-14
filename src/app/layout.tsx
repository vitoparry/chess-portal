import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'STV Chess Championship',
  description: 'Live tournament tracking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        
        {/* 🦁 CLUB LOGO OVERLAY */}
        {/* This stays fixed in the top-left corner on ALL pages */}
        <div className="fixed top-2 left-2 z-50 mix-blend-plus-lighter opacity-90 hover:opacity-100 transition duration-300">
           <a href="/" title="Back to Home">
             <img 
               src="https://stvgermany.de/wp-content/uploads/2020/05/logo-1.png"
               alt="STV Logo"
               className="w-12 h-auto md:w-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
             />
           </a>
        </div>

        {children}
      </body>
    </html>
  )
}