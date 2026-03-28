'use client'
import { motion } from 'motion/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { LandingButton } from './LandingButton'

export function LandingCta() {
  return (
    <section className="py-32 md:py-48 bg-[#F4F2ED] relative overflow-hidden">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0A0A0A] rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="bg-noise opacity-20" />

          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#E25F38]/10 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="max-w-2xl text-left">
              <div className="flex items-center gap-4 mb-8">
                <Sparkles className="w-5 h-5 text-[#E25F38]" />
                <span className="micro-label text-[#E25F38] block">Ready to upgrade?</span>
              </div>
              <h2 className="text-[4rem] md:text-[6rem] lg:text-[7.5rem] font-medium text-[#F4F2ED] mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
                Keep your clinic responsive, no matter what happens.
              </h2>
              <p className="text-xl md:text-2xl text-white/50 mb-12 leading-relaxed font-light text-balance max-w-lg">
                Join the top-tier veterinary practices using VetDesk to protect their staff, streamline their front desk, and elevate their standard of care.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <LandingButton size="lg" variant="accent" className="group w-full sm:w-auto text-lg px-10 h-16">
                  Request a Private Demo
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </LandingButton>
                <LandingButton size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white text-lg px-10 h-16">
                  Talk to Sales
                </LandingButton>
                <Link
                  href="/overview"
                  className="inline-flex items-center justify-center h-16 px-10 text-lg rounded-full border border-white/20 text-white/70 font-semibold hover:bg-white/10 transition-colors"
                >
                  View Dashboard →
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-8 border border-white/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-[#E25F38]/20 rounded-full blur-2xl" />
                <div className="absolute w-16 h-16 bg-[#F4F2ED] rounded-full shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#E25F38] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
