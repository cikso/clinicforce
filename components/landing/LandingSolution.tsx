'use client'
import { motion } from 'motion/react'

export function LandingSolution() {
  const steps = [
    {
      num: '01',
      title: 'Instant Connection',
      desc: 'Client connects via voice or web chat. No holding, no phone trees.',
      width: 'lg:col-span-3',
      offset: 'lg:mt-0',
    },
    {
      num: '02',
      title: 'Intelligent Intake',
      desc: 'AI captures owner details, pet name, and the reason for the call — cleanly and conversationally.',
      width: 'lg:col-span-4',
      offset: 'lg:mt-16',
    },
    {
      num: '03',
      title: 'Urgency Assessment',
      desc: 'When something urgent comes in, VetForce recognises it and escalates appropriately.',
      width: 'lg:col-span-3',
      offset: 'lg:mt-8',
    },
    {
      num: '04',
      title: 'Structured Handoff',
      desc: 'Delivers a clean intake summary to your team — so they pick up exactly where VetForce left off.',
      width: 'lg:col-span-2',
      offset: 'lg:mt-24',
    },
  ]

  return (
    <section className="py-32 md:py-48 bg-[#E8E5DF] relative overflow-hidden" id="solution">
      <div className="bg-noise" />
      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="max-w-4xl mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#0A0A0A]/20" />
            <span className="micro-label text-[#0A0A0A]/50 block">INTELLIGENT CONTINUITY</span>
          </div>
          <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium mb-6 tracking-[-0.03em] text-balance text-[#0A0A0A] leading-[0.85]">
            Seamless coverage. Zero dropped calls.
          </h2>
          <p className="text-xl md:text-2xl text-[#0A0A0A]/60 leading-relaxed font-light max-w-2xl">
            VetForce acts as an invisible extension of your team — answering calls, capturing caller and patient details, handling routine enquiries, and escalating anything urgent. Turn it on when you need it, and your front desk never goes dark.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[28px] left-0 w-full h-px bg-gradient-to-r from-[#0A0A0A]/20 via-[#0A0A0A]/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`relative ${step.width} ${step.offset} group`}
              >
                <div className="relative z-10 pr-8">
                  <div className="w-14 h-14 rounded-full bg-[#F4F2ED] border border-black/5 flex items-center justify-center mb-10 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-noise opacity-10" />
                    <span className="font-bold text-[#0A0A0A] relative z-10">{step.num}</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#E25F38] border-2 border-[#E8E5DF] z-20" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium mb-4 text-[#0A0A0A] tracking-tight">{step.title}</h3>
                  <p className="text-[#0A0A0A]/60 text-lg leading-relaxed font-light">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
