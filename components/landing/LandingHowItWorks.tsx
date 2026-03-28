'use client'
import { motion } from 'motion/react'

export function LandingHowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'The Morning Rush',
      description: 'Handle simultaneous calls without putting anxious owners on hold while checking in patients.',
      align: 'md:items-start md:text-left',
      offset: 'md:ml-0 md:mr-auto',
    },
    {
      number: '02',
      title: 'Lunch & Learn',
      description: 'Allow your entire staff to step away for training without turning off the phones.',
      align: 'md:items-end md:text-right',
      offset: 'md:ml-auto md:mr-0',
    },
    {
      number: '03',
      title: 'Unexpected Sick Leave',
      description: 'Instantly absorb the impact of a missing receptionist with the flip of a switch.',
      align: 'md:items-start md:text-left',
      offset: 'md:ml-0 md:mr-auto',
    },
    {
      number: '04',
      title: 'Internal Meetings',
      description: 'Keep the clinic running smoothly while your team aligns on daily operations.',
      align: 'md:items-end md:text-right',
      offset: 'md:ml-auto md:mr-0',
    },
    {
      number: '05',
      title: 'After-Hours Triage',
      description: 'Provide professional, intelligent routing and emergency escalation when the clinic is dark.',
      align: 'md:items-start md:text-left',
      offset: 'md:ml-0 md:mr-auto',
    },
  ]

  return (
    <section className="py-32 md:py-48 bg-[#0A0A0A] text-[#F4F2ED] relative overflow-hidden" id="how-it-works">
      <div className="bg-noise opacity-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container mx-auto px-6 max-w-[1400px] relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-32">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#E25F38]/50" />
            <span className="micro-label text-[#E25F38] block">FLEXIBLE DEPLOYMENT</span>
            <div className="h-px w-12 bg-[#E25F38]/50" />
          </div>
          <h2 className="text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium mb-8 tracking-[-0.03em] leading-[0.85] text-balance">
            Coverage for every gap in your day.
          </h2>
          <p className="text-xl md:text-2xl text-white/50 leading-relaxed font-light max-w-2xl mx-auto">
            VetDesk is ready whenever your human team is stretched.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="hidden md:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col gap-24 md:gap-32 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative z-10 flex flex-col items-center text-center max-w-lg ${step.align} ${step.offset}`}
              >
                <div className={`hidden md:block absolute top-12 w-3 h-3 rounded-full bg-[#E25F38] shadow-[0_0_12px_rgba(226,95,56,0.5)] ${index % 2 === 0 ? 'right-[-1.5rem] md:right-[-6.5rem]' : 'left-[-1.5rem] md:left-[-6.5rem]'}`} />

                <div className="w-24 h-24 rounded-full bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-500" />
                  <span className="text-4xl font-bold text-[#F4F2ED] relative z-10">{step.number}</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-medium mb-6 tracking-tight">{step.title}</h3>
                <p className="text-white/50 text-lg leading-relaxed font-light">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
