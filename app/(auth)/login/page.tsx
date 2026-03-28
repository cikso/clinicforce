import LoginForm from '@/components/auth/LoginForm'
import { Phone, Shield, Clock } from 'lucide-react'

export const metadata = {
  title: 'Sign In — VetDesk',
}

const benefits = [
  { icon: Phone,  text: 'AI answers every call when you\'re unavailable' },
  { icon: Shield, text: 'Receptionist-controlled coverage windows' },
  { icon: Clock,  text: 'Full handover log and follow-up queue' },
]

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">

      {/* ── Left: Brand panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0f2744] flex-col justify-between p-12 relative overflow-hidden">

        {/* Decorative rings */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-white/5" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full border border-white/5 translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-full bg-[#0ea5e9] flex items-center justify-center shrink-0">
            <div className="w-5 h-5 bg-white rounded-sm relative flex items-center justify-center">
              <div className="w-3 h-0.5 bg-[#0ea5e9] absolute" />
              <div className="w-0.5 h-3 bg-[#0ea5e9] absolute" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white leading-tight">VetDesk</h1>
            <p className="text-[9px] font-bold text-sky-400 uppercase tracking-widest">Front Desk AI</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your clinic,<br />always covered.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 max-w-xs">
            AI answers your calls, triages urgency, and hands everything over — so your team never misses a patient.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600 relative z-10">
          © {new Date().getFullYear()} VetDesk. Built for Australian veterinary clinics.
        </p>
      </div>

      {/* ── Right: Form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <LoginForm />
      </div>

    </div>
  )
}
