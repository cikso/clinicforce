'use client'
import { motion } from 'motion/react'

export function LandingProblem() {
  return (
    <section className="py-32 md:py-48 bg-[#0A0A0A] text-[#F4F2ED] relative overflow-hidden">
      <div className="bg-noise opacity-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-[#E25F38]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">

          <div className="lg:col-span-5 lg:sticky lg:top-48 h-fit">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-12 bg-[#E25F38]/50" />
                <span className="micro-label text-[#E25F38] block">THE FRONT DESK BOTTLENECK</span>
              </div>
              <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
                The phone shouldn&apos;t dictate your standard of care.
              </h2>
              <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light max-w-lg">
                Clinics don&apos;t just miss calls at 2:00 AM. They miss them during the 9:00 AM rush, during all-staff meetings, and when reception is unexpectedly short-staffed. Traditional voicemail is a black hole that frustrates pet owners and creates clinical risk when every second counts.
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/5 border border-white/10 p-10 md:p-16 rounded-[2.5rem] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-noise opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10">
                <span className="micro-label text-[#E25F38] mb-8 block">01 / Missed Urgency</span>
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-6 tracking-tight leading-[0.9]">Critical cases slip through the cracks.</h3>
                <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light">When lines are busy or unmonitored, anxious owners hang up. A missed call isn&apos;t just lost revenue; it&apos;s a compromised patient outcome.</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-noise opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <span className="micro-label text-white/40 mb-8 block">02 / Staff Burnout</span>
                  <h3 className="text-2xl font-medium mb-4 tracking-tight">Reception overload.</h3>
                  <p className="text-white/50 leading-relaxed font-light">Receptionists are overwhelmed by constant interruptions, morning callback chaos, and the pressure of a ringing phone.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-noise opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <span className="micro-label text-white/40 mb-8 block">03 / Client Frustration</span>
                  <h3 className="text-2xl font-medium mb-4 tracking-tight">The voicemail black hole.</h3>
                  <p className="text-white/50 leading-relaxed font-light">Anxious pet owners are left waiting on hold or forced to leave unstructured messages when they need guidance most.</p>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
