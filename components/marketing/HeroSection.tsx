'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'motion/react'
import MarketingNavbar from './MarketingNavbar'

// ─── Types ─────────────────────────────────────────────────────────────────────

type Industry = 'vet' | 'dental' | 'gp' | 'chiro'

// ─── Copy ──────────────────────────────────────────────────────────────────────

const INDUSTRY_COPY: Record<Industry, string> = {
  vet: 'Sarah handles inbound calls, takes bookings, and triages urgency around the clock — so your team can focus on the work that actually needs them. Turn her on or off whenever you need. No lock-in. No complexity.',
  dental:
    'Built for dental practices. Sarah manages recalls, new patient enquiries, and appointment confirmations without a single hold tone.',
  gp: 'Built for GP clinics. Sarah screens urgency, books callbacks, and routes messages to the right practitioner — every time.',
  chiro:
    'Built for chiropractic practices. Sarah handles new patient bookings, follow-up calls, and after-hours enquiries around the clock.',
}

// ─── SVG Icons (inline only, no external libraries) ────────────────────────────

function PawIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <ellipse cx="5" cy="5.5" rx="1.6" ry="2" />
      <ellipse cx="10" cy="4" rx="1.6" ry="2" />
      <ellipse cx="15" cy="5.5" rx="1.6" ry="2" />
      <ellipse cx="3" cy="10" rx="1.3" ry="1.8" />
      <path d="M10 8c-2.8 0-5.2 1.8-5.2 4.8C4.8 16 6.8 17.2 10 17.2s5.2-1.2 5.2-4.4C15.2 9.8 12.8 8 10 8z" />
    </svg>
  )
}

function ToothIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M10 2.5C7.5 2.5 6 4.2 6 6.2c0 1.2.4 2.5.8 3.8L8.2 17c.2.7.8.8 1.2 0L10 14l.6 3c.4.8 1 .7 1.2 0l1.4-7c.4-1.3.8-2.6.8-3.8C14 4.2 12.5 2.5 10 2.5z" />
    </svg>
  )
}

function StethoscopeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M5 2.5v6a5 5 0 0 0 5 5 5 5 0 0 0 5-5v-6" />
      <path d="M5 2.5h3" />
      <path d="M12 2.5h3" />
      <path d="M15 13.5a3.5 3.5 0 0 1-3.5 3.5" />
      <circle cx="11.5" cy="17" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function SpineIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="7.5" y="1.5" width="5" height="3.5" rx="0.8" />
      <rect x="7.5" y="7" width="5" height="3.5" rx="0.8" />
      <rect x="7.5" y="12.5" width="5" height="3.5" rx="0.8" />
      <line x1="10" y1="5" x2="10" y2="7" />
      <line x1="10" y1="10.5" x2="10" y2="12.5" />
      <line x1="5.5" y1="3.2" x2="7.5" y2="3.2" />
      <line x1="12.5" y1="3.2" x2="14.5" y2="3.2" />
      <line x1="5.5" y1="8.7" x2="7.5" y2="8.7" />
      <line x1="12.5" y1="8.7" x2="14.5" y2="8.7" />
      <line x1="10" y1="16" x2="10" y2="19" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M2.5 7l3 3 6-5.5" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3 5l4 4 4-4" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" />
    </svg>
  )
}

// ─── Animation variants ────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 20,
    },
  },
}

// ─── LiveWaveform (isolated, memoized) ────────────────────────────────────────

const LiveWaveform = React.memo(function LiveWaveform() {
  const heights = [14, 22, 32, 18, 26]
  const delays = [0, 0.18, 0.32, 0.1, 0.24]

  return (
    <div className="flex items-center gap-[3px] h-8" aria-hidden="true">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-[#17C4BE]"
          style={{ height: h }}
          animate={{
            scaleY: [1, 2.1, 0.55, 1.7, 1],
            opacity: [0.65, 1, 0.65, 1, 0.75],
          }}
          transition={{
            duration: 1.35,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: delays[i],
          }}
        />
      ))}
    </div>
  )
})

// ─── LiveCallCard (isolated, memoized) ────────────────────────────────────────

const LiveCallCard = React.memo(function LiveCallCard() {
  const recentCalls = [
    {
      initials: 'MC',
      name: 'Mrs Chen',
      summary: 'Appointment query',
      time: '2m ago',
      status: 'Handled',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      avatarClass: 'bg-[#E5F9F8] text-[#17C4BE]',
    },
    {
      initials: 'JR',
      name: 'James R',
      summary: 'Prescription refill',
      time: '11m ago',
      status: 'Callback',
      statusClass: 'bg-amber-50 text-amber-700 border-amber-100',
      avatarClass: 'bg-slate-100 text-slate-600',
    },
    {
      initials: '?',
      name: 'Unknown',
      summary: 'After-hours enquiry',
      time: '31m ago',
      status: 'Handled',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      avatarClass: 'bg-slate-100 text-slate-400',
    },
  ]

  return (
    <motion.div
      className="relative z-10 w-full max-w-[400px] rounded-2xl bg-white/80 backdrop-blur-xl border border-white/30"
      style={{
        boxShadow:
          '0 40px 80px -20px rgba(23,196,190,0.12), inset 0 1px 0 rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.06)',
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">
            Live Call Dashboard
          </span>
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
            <span className="font-mono text-[9px] font-bold text-emerald-700 tracking-[0.15em] uppercase">
              LIVE
            </span>
          </div>
        </div>

        {/* Active call block */}
        <div className="rounded-xl bg-[#E5F9F8] border border-[#E5E7EB] p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#17C4BE] flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[11px] font-bold text-white tracking-tight">
                SC
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 leading-none">
                Sarah is handling a call
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inbound — in progress
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="font-mono text-sm font-bold text-[#17C4BE] tabular-nums">
                0:47
              </span>
            </div>
          </div>

          <LiveWaveform />

          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="font-mono text-[10px] font-medium bg-white border border-slate-200 text-slate-500 rounded-full px-2.5 py-1">
              Urgency: Routine
            </span>
            <span className="font-mono text-[10px] font-medium bg-[#E5F9F8] border border-[#E5E7EB] text-[#17C4BE] rounded-full px-2.5 py-1">
              Category: Appointment Enquiry
            </span>
          </div>
        </div>

        {/* Recent calls */}
        <div className="mb-4">
          <p className="font-mono text-[9px] text-slate-400 uppercase tracking-[0.12em] mb-2.5">
            Recent Calls
          </p>
          <div className="flex flex-col gap-2.5">
            {recentCalls.map((call, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${call.avatarClass}`}
                >
                  <span className="font-mono text-[9px] font-bold">{call.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate leading-none">
                    {call.name} — {call.summary}
                  </p>
                  <p className="font-mono text-[9px] text-slate-400 mt-0.5">{call.time}</p>
                </div>
                <span
                  className={`font-mono text-[9px] font-semibold border rounded-full px-2 py-0.5 whitespace-nowrap flex-shrink-0 ${call.statusClass}`}
                >
                  {call.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="border-t border-slate-100 pt-3.5 grid grid-cols-3 divide-x divide-slate-100">
          {[
            { value: '14', label: 'calls today' },
            { value: '0', label: 'missed' },
            { value: '3', label: 'callbacks' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-2 first:pl-0 last:pr-0">
              <span className="font-mono text-xl font-bold text-slate-800 leading-none tabular-nums">
                {stat.value}
              </span>
              <span className="font-mono text-[8px] text-slate-400 mt-1 uppercase tracking-[0.1em] text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
})

// ─── Industry selector pills ───────────────────────────────────────────────────

const industries: {
  id: Industry
  label: string
  Icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'vet', label: 'Veterinary', Icon: PawIcon },
  { id: 'dental', label: 'Dental', Icon: ToothIcon },
  { id: 'gp', label: 'GP & Medical', Icon: StethoscopeIcon },
  { id: 'chiro', label: 'Chiropractic', Icon: SpineIcon },
]

// ─── HeroSection ──────────────────────────────────────────────────────────────

export default function HeroSection({ onBookDemo }: { onBookDemo?: () => void }) {
  const [activeIndustry, setActiveIndustry] = useState<Industry>('vet')
  const handleBookDemo = onBookDemo ?? (() => {})

  return (
    <>
      <MarketingNavbar onBookDemo={handleBookDemo} />
      <section className="relative min-h-[100dvh] bg-[#FFFFFF] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-20 min-h-[calc(100dvh-4rem)] py-16 lg:py-0">
            {/* ── Left: Content ── */}
            <motion.div
              className="flex flex-col items-start gap-7 lg:py-24"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Eyebrow */}
              <motion.div variants={itemVariants}>
                <div className="inline-flex items-center gap-2 bg-[#E5F9F8] border border-[#E5E7EB] rounded-full px-3.5 py-1.5">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <span className="text-[11px] font-semibold text-[#17C4BE] uppercase tracking-[0.12em]">
                    AI Front Desk — Built for Clinics
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={itemVariants}>
                <h1
                  className="text-5xl md:text-7xl font-bold leading-none tracking-tighter text-[#1A1A1A]"
                  style={{ fontFamily: 'var(--font-geist-sans)' }}
                >
                  <span className="block">Your clinic&apos;s phones,</span>
                  <span className="relative inline-block mt-1">
                    <span
                      className="bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, #17C4BE 0%, #0F9995 100%)',
                      }}
                    >
                      answered.
                    </span>
                    {/* Underline SVG accent */}
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 200 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <motion.path
                        d="M2 5.5C50 2.5 100 1.5 198 4.5"
                        stroke="#17C4BE"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{
                          duration: 0.7,
                          delay: 0.65,
                          ease: 'easeOut',
                        }}
                      />
                    </svg>
                  </span>
                </h1>
              </motion.div>

              {/* Industry selector pills */}
              <motion.div variants={itemVariants} className="w-full">
                <div
                  className="flex gap-2 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {industries.map(({ id, label, Icon }) => {
                    const isActive = activeIndustry === id
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveIndustry(id)}
                        className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17C4BE] focus-visible:ring-offset-1 transition-colors duration-150"
                        style={{ color: isActive ? '#fff' : '#6B6B6B' }}
                        aria-pressed={isActive}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activePill"
                            className="absolute inset-0 rounded-full bg-[#17C4BE]"
                            transition={{
                              type: 'spring',
                              stiffness: 350,
                              damping: 30,
                            }}
                            aria-hidden="true"
                          />
                        )}
                        {!isActive && (
                          <span className="absolute inset-0 rounded-full bg-white border border-[#E5E7EB]" />
                        )}
                        <Icon className="w-3.5 h-3.5 relative z-10 flex-shrink-0" />
                        <span className="relative z-10">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Sub-headline — morphs by industry */}
              <motion.div
                variants={itemVariants}
                className="min-h-[88px] flex items-start"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeIndustry}
                    className="text-lg text-slate-500 leading-relaxed"
                    style={{
                      maxWidth: '52ch',
                      fontFamily: 'var(--font-geist-sans)',
                    }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{
                      type: 'spring',
                      stiffness: 80,
                      damping: 20,
                    }}
                  >
                    {INDUSTRY_COPY[activeIndustry]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>

              {/* CTA Row */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-5 flex-wrap"
              >
                <MagneticButton onClick={handleBookDemo}>
                  <span className="inline-flex items-center gap-2 bg-[#17C4BE] hover:bg-[#13ADA8] active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer select-none">
                    Book a Demo
                  </span>
                </MagneticButton>

                <a
                  href="#product-ui"
                  className="group inline-flex items-center gap-2 text-slate-500 hover:text-[#1A1A1A] font-medium text-sm transition-colors duration-150"
                >
                  See how it works
                  <motion.span
                    className="inline-flex"
                    animate={{ x: [0, 3, 0] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.span>
                </a>
              </motion.div>

              {/* Trust micro-bar */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-x-5 gap-y-2"
              >
                {[
                  'Live in 48 hours',
                  'Switch AI on or off anytime',
                  'No lock-in contracts',
                  '$15 a day, fully staffed',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckIcon className="w-3.5 h-3.5 text-[#17C4BE] flex-shrink-0" />
                    <span className="text-xs text-slate-400 font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* ── Right: Product UI Mock ── */}
            <motion.div
              className="relative hidden lg:flex items-center justify-center lg:py-24"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: 'spring',
                stiffness: 60,
                damping: 20,
                delay: 0.25,
              }}
            >
              {/* Soft radial halo blob behind card */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
              >
                <div
                  className="w-[480px] h-[480px] rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(23,196,190,0.18) 0%, rgba(23,196,190,0.07) 45%, transparent 72%)',
                    filter: 'blur(64px)',
                  }}
                />
              </div>

              <LiveCallCard />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}

// ─── MagneticButton (isolated client leaf) ────────────────────────────────────

function MagneticButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  const x = useSpring(rawX, { stiffness: 180, damping: 18 })
  const y = useSpring(rawY, { stiffness: 180, damping: 18 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      rawX.set((e.clientX - cx) * 0.28)
      rawY.set((e.clientY - cy) * 0.28)
    },
    [rawX, rawY],
  )

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="inline-block cursor-pointer"
    >
      {children}
    </motion.div>
  )
}
