'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LandingButton } from './LandingButton'
import { LayoutDashboard } from 'lucide-react'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="fixed top-0 w-full z-50 px-4 py-6 pointer-events-none flex justify-center">
      <div className={cn(
        'pointer-events-auto flex items-center justify-between transition-all duration-500 rounded-full border relative overflow-hidden',
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-black/10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] px-6 py-3 w-full max-w-5xl'
          : 'bg-transparent border-transparent px-6 py-4 w-full max-w-7xl'
      )}>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-2.5 h-2.5 bg-[#E25F38] rounded-full" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0A0A0A]">VetDesk</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 relative z-10">
          <a href="#features" className="text-sm font-medium text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors">Platform</a>
          <a href="#solution" className="text-sm font-medium text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors">Triage Engine</a>
          <a href="#how-it-works" className="text-sm font-medium text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors">How It Works</a>
        </nav>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0A3622] text-[#F4F2ED] text-sm font-semibold hover:bg-[#125235] transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Clinic Login
          </Link>
          <LandingButton size="sm" className="hidden sm:flex bg-[#0A0A0A] text-[#F4F2ED] hover:bg-[#0A0A0A]/90 rounded-full px-6">Book Demo</LandingButton>
        </div>
      </div>
    </header>
  )
}
