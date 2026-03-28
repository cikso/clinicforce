'use client'
import { motion } from 'motion/react'
import { ShieldCheck, HeartPulse, Star, FileCheck } from 'lucide-react'

export function LandingBenefits() {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Fewer Missed Calls',
      desc: 'Capture every opportunity and ensure no urgent case is ever ignored.',
    },
    {
      icon: HeartPulse,
      title: 'Reduced Staff Pressure',
      desc: 'Protect your team from phone fatigue, context-switching, and burnout.',
    },
    {
      icon: Star,
      title: 'Premium Client Experience',
      desc: 'Clients feel heard, understood, and guided with empathy—even when you\'re busy.',
    },
    {
      icon: FileCheck,
      title: 'Cleaner Operations',
      desc: 'Start the day or return from lunch to organized, prioritized data, not a blinking voicemail light.',
    },
  ]

  return (
    <section className="py-32 md:py-48 bg-[#E8E5DF] border-y border-black/5 relative overflow-hidden">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-24 items-start">

          <div className="lg:sticky lg:top-32 max-w-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px w-12 bg-[#E25F38]/50" />
              <span className="micro-label text-[#E25F38] block">CLINIC OUTCOMES</span>
            </div>
            <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium text-[#0A0A0A] mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
              Give your front desk room to breathe.
            </h2>
            <p className="text-xl md:text-2xl text-[#0A0A0A]/60 leading-relaxed font-light mb-12 max-w-lg">
              The ROI of a smarter front door isn&apos;t just financial. It&apos;s measured in team morale, patient outcomes, and client loyalty.
            </p>

            <div className="hidden lg:flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-[#E8E5DF] bg-white overflow-hidden">
                    <img src={`https://picsum.photos/seed/vet${i}/100/100`} alt="Vet" className="w-full h-full object-cover grayscale opacity-80" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium text-[#0A0A0A]/60">
                Trusted by 500+ clinics
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="mb-6 relative inline-block">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 flex items-center justify-center shadow-sm relative z-10 transition-transform duration-500 group-hover:-translate-y-1 overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <benefit.icon className="w-7 h-7 text-[#0A3622] relative z-10" strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-0 bg-[#E25F38]/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h3 className="text-2xl font-medium text-[#0A0A0A] mb-4 tracking-tight">{benefit.title}</h3>
                <p className="text-lg text-[#0A0A0A]/60 leading-relaxed font-light">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
