'use client'

const integrations = [
  'Ezyvet',
  'Provet Cloud',
  'Cornerstone',
  'RxWorks',
  'VetLink',
  'Cliniko',
]

export default function IntegrationLogos() {
  return (
    <section className="px-1 py-16">
      <div className="text-center mb-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#1B6B4A]">
          Integrations
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#1A1A1A] sm:text-3xl">
          Connects with your practice management system
        </h2>
        <p className="mt-3 text-base text-[#536171]">
          Direct integrations coming soon
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {integrations.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[#dde5ec] bg-white p-6 opacity-60"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f7fb] text-[#9CA3AF]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="16" height="16" rx="3" />
                <path d="M7 10h6M10 7v6" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#536171]">{name}</span>
            <span className="rounded-full bg-[#f3f7fb] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Coming Soon
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
