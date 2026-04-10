import type { Metadata } from 'next'
import Card from '@/app/components/ui/Card'
import Badge from '@/app/components/ui/Badge'
import Button from '@/app/components/ui/Button'

/* ── Sample Data ────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  { name: 'All Articles', count: 24, icon: 'grid' },
  { name: 'Appointments', count: 6, icon: 'calendar' },
  { name: 'Vaccinations', count: 4, icon: 'shield' },
  { name: 'Surgery & Procedures', count: 3, icon: 'scissors' },
  { name: 'Medications', count: 4, icon: 'pill' },
  { name: 'Billing & Payments', count: 3, icon: 'dollar' },
  { name: 'Emergency', count: 2, icon: 'alert' },
  { name: 'General Care', count: 2, icon: 'heart' },
]

interface FaqEntry {
  question: string
  answer: string
  category: string
  updated: string
}

const FAQ_ENTRIES: FaqEntry[] = [
  {
    question: 'How do I book an appointment?',
    answer: 'You can book an appointment by calling the clinic during business hours, or Sarah AI can help you book 24/7 over the phone. Simply tell Sarah the reason for your visit and your preferred time, and she\'ll find the next available slot.',
    category: 'Appointments',
    updated: '2 days ago',
  },
  {
    question: 'What are the clinic opening hours?',
    answer: 'We are open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 1:00 PM. We are closed on Sundays and public holidays. For after-hours emergencies, Sarah AI can triage and connect you to our on-call vet.',
    category: 'General Care',
    updated: '1 week ago',
  },
  {
    question: 'When is my pet due for vaccination?',
    answer: 'Vaccination schedules vary by species and age. Puppies and kittens need a series of shots at 6-8, 10-12, and 14-16 weeks. Annual boosters are recommended for adult pets. Call us or ask Sarah AI to check your pet\'s vaccination history.',
    category: 'Vaccinations',
    updated: '3 days ago',
  },
  {
    question: 'How much does a consultation cost?',
    answer: 'A standard consultation is $85. Emergency consultations are $165. Specialist referral consultations vary — our team will provide a quote before the appointment. We accept all major credit cards and offer payment plans for procedures over $500.',
    category: 'Billing & Payments',
    updated: '5 days ago',
  },
  {
    question: 'What should I do in a pet emergency?',
    answer: 'If you believe your pet is experiencing a medical emergency, call us immediately. If it\'s after hours, Sarah AI will triage the situation and can connect you to our on-call vet or direct you to the nearest emergency animal hospital.',
    category: 'Emergency',
    updated: '1 day ago',
  },
  {
    question: 'How do I refill my pet\'s prescription?',
    answer: 'Call the clinic and ask for a prescription refill, or simply tell Sarah AI your pet\'s name and medication. We\'ll prepare the refill for pickup. For ongoing prescriptions, we can set up auto-reminders so you never miss a refill.',
    category: 'Medications',
    updated: '4 days ago',
  },
  {
    question: 'What pre-surgery preparation is needed?',
    answer: 'For most surgeries, your pet should fast from 10 PM the night before (water is okay until morning). Remove food bowls and keep pets separate if you have multiple animals. Arrive at 8 AM on the day of surgery. We\'ll call you when the procedure is complete.',
    category: 'Surgery & Procedures',
    updated: '1 week ago',
  },
  {
    question: 'Can I cancel or reschedule an appointment?',
    answer: 'Yes! You can cancel or reschedule by calling us at least 24 hours before your appointment. Sarah AI can also help you reschedule over the phone. Cancellations with less than 24 hours notice may incur a $25 late cancellation fee.',
    category: 'Appointments',
    updated: '3 days ago',
  },
  {
    question: 'Do you offer payment plans?',
    answer: 'Yes, we offer interest-free payment plans through VetPay for procedures over $500. You can apply at the clinic or online. We also accept pet insurance claims from all major providers — just bring your policy details to your appointment.',
    category: 'Billing & Payments',
    updated: '1 week ago',
  },
  {
    question: 'What vaccines does my puppy need?',
    answer: 'Puppies need a core vaccination series: C3 (distemper, hepatitis, parvovirus) at 6-8 weeks, 10-12 weeks, and 14-16 weeks. We also recommend kennel cough (C5) vaccination if your puppy will be socialising or attending daycare.',
    category: 'Vaccinations',
    updated: '2 days ago',
  },
  {
    question: 'How long is recovery after desexing?',
    answer: 'Most pets recover within 10-14 days. Keep them calm and confined for the first week. An Elizabethan collar prevents licking the wound. We\'ll schedule a free follow-up check at 10 days to remove sutures and ensure proper healing.',
    category: 'Surgery & Procedures',
    updated: '5 days ago',
  },
  {
    question: 'Can Sarah AI answer medical questions?',
    answer: 'Sarah AI can provide general health information and check your pet\'s records, but cannot diagnose conditions or prescribe treatment. For medical concerns, Sarah will help you book an appointment or connect you with a vet for urgent issues.',
    category: 'General Care',
    updated: '1 day ago',
  },
]

/* ── Category Icon ──────────────────────────────────────────────────────────── */

function CategoryIcon({ icon }: { icon: string }) {
  const cls = "text-[var(--text-tertiary)]"
  switch (icon) {
    case 'grid':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><rect x="2" y="2" width="4" height="4" rx="0.5" /><rect x="8" y="2" width="4" height="4" rx="0.5" /><rect x="2" y="8" width="4" height="4" rx="0.5" /><rect x="8" y="8" width="4" height="4" rx="0.5" /></svg>
    case 'calendar':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><rect x="1.5" y="2.5" width="11" height="9.5" rx="1.5" /><path d="M1.5 5.5h11M4.5 1v2.5M9.5 1v2.5" /></svg>
    case 'shield':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><path d="M7 1.5L2 3.5v3c0 3.5 2.5 5.5 5 6.5 2.5-1 5-3 5-6.5v-3L7 1.5z" /></svg>
    case 'scissors':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><circle cx="4" cy="10.5" r="1.5" /><circle cx="10" cy="10.5" r="1.5" /><path d="M5.3 9.5L12 2M8.7 9.5L2 2" /></svg>
    case 'pill':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><rect x="4" y="1.5" width="6" height="11" rx="3" /><path d="M4 7h6" /></svg>
    case 'dollar':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><path d="M7 1v12M9.5 3.5H5.75a1.75 1.75 0 0 0 0 3.5h2.5a1.75 1.75 0 0 1 0 3.5H4.5" /></svg>
    case 'alert':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><path d="M7 1.5L1 12h12L7 1.5z" /><path d="M7 6v2.5" /><circle cx="7" cy="10" r="0.3" fill="currentColor" /></svg>
    case 'heart':
      return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className={cls}><path d="M7 12S1.5 8.5 1.5 5a2.75 2.75 0 0 1 5.5 0 2.75 2.75 0 0 1 5.5 0c0 3.5-5.5 7-5.5 7z" /></svg>
    default:
      return null
  }
}

/* ── Page ────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = { title: 'Knowledge Base — ClinicForce' }

export default function KnowledgePage() {
  return (
    <div className="space-y-5">
      {/* Coming Soon Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-[var(--brand-light)] border border-[var(--brand)]/20">
        <p className="text-[13px] text-[var(--brand-dark)]">
          Knowledge Base editing and AI training are coming soon. Currently showing sample content.
        </p>
      </div>

      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-[var(--text-primary)] font-heading">Knowledge Base</h2>
          <Badge variant="info">{FAQ_ENTRIES.length} articles</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.3" strokeLinecap="round" className="absolute left-2.5 top-1/2 -translate-y-1/2">
              <circle cx="6" cy="6" r="4.5" /><path d="M9.5 9.5L13 13" />
            </svg>
            <input
              type="text"
              placeholder="Search articles..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] w-[200px] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
              disabled
            />
          </div>
          <Button variant="primary" size="sm" className="opacity-50 cursor-not-allowed" disabled>
            Add Article
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Sidebar - Categories */}
        <div className="w-full lg:w-[220px] shrink-0 space-y-3">
          <Card>
            <div className="space-y-0.5 -m-1">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                    i === 0
                      ? 'bg-[var(--brand-light)] text-[var(--brand)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <CategoryIcon icon={cat.icon} />
                  <span className="text-[13px] font-medium flex-1 truncate">{cat.name}</span>
                  <span className={`text-[11px] font-mono-data ${i === 0 ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)]'}`}>{cat.count}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Test Sarah Card */}
          <Card className="!bg-gradient-to-br from-[var(--brand-light)] to-white border-[var(--brand)]/20">
            <div className="text-center space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[var(--brand)] flex items-center justify-center mx-auto">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 2a6 6 0 0 1 6 6v2a6 6 0 0 1-12 0V8a6 6 0 0 1 6-6z" />
                  <path d="M7 18h6M10 14v4" />
                </svg>
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)] font-heading">Test Sarah AI</p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-1">
                  Ask Sarah a question to see how she uses the knowledge base to respond to callers.
                </p>
              </div>
              <Button variant="primary" size="sm" className="w-full opacity-50 cursor-not-allowed" disabled>
                Start Test Call
              </Button>
              <p className="text-[10px] text-[var(--text-tertiary)]">Coming soon</p>
            </div>
          </Card>
        </div>

        {/* FAQ Articles */}
        <div className="flex-1 space-y-2">
          {FAQ_ENTRIES.map((entry, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start gap-3">
                {/* Number badge */}
                <div className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-[var(--text-tertiary)] font-mono-data">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-[14px] font-semibold text-[var(--text-primary)]">{entry.question}</h3>
                    <span className="text-[10px] text-[var(--text-tertiary)] whitespace-nowrap shrink-0">{entry.updated}</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">{entry.answer}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] text-[10px] font-medium text-[var(--text-tertiary)]">
                      {entry.category}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
