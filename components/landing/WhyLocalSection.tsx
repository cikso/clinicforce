'use client'

type LocalPoint = { title: string; body: string }

const POINTS: LocalPoint[] = [
  {
    title: 'Your data never leaves Australia.',
    body: 'Every call recording, transcript, and patient message is stored in AWS ap-southeast-2 (Sydney). No cross-border transfers, no US cloud exposure, no awkward conversations with your compliance officer.',
  },
  {
    title: 'Privacy Act 1988 & APPs aligned.',
    body: "We've designed ClinicForce against the Australian Privacy Principles from day one — not bolted on as a GDPR afterthought. Encrypted in transit and at rest, row-level security, explicit patient consent flows, full audit trail.",
  },
  {
    title: 'Built for how Australian clinics actually run.',
    body: 'Bulk billing, Medicare item codes, and the PMS systems you actually use — ezyVet, Provet Cloud, Dental4Web. Your AI receptionist speaks Australian English, knows what a "Medicare card" is, and won\u2019t ask patients for their ZIP code.',
  },
  {
    title: 'Support that answers in AEDT.',
    body: 'Something\u2019s not right at 10am on a Tuesday? Our team is at our desks in Sydney. No "please allow 24–48 hours for a response." No ticket queues routed through three time zones. Just a phone call or a quick reply.',
  },
]

export default function WhyLocalSection() {
  return (
    <section id="why-local" className="why-local-section">
      <div className="container">
        <div className="why-local-grid">
          <div className="why-local-intro reveal">
            <div className="eyebrow">Why local matters</div>
            <h2 className="section-heading" style={{ marginTop: 14 }}>
              Not another overseas SaaS tool pretending to understand you.
            </h2>
            <p className="why-local-lead">
              ClinicForce is Australian-owned, built by an Australian team, and hosted on
              Australian infrastructure. When something breaks, you ring Sydney — not a
              helpdesk in Utah or Manila.
            </p>

            <div className="data-region-card">
              <div className="drc-label">Primary data region</div>
              <div className="drc-body">
                <div className="drc-pin">
                  <span className="drc-pin-dot" aria-hidden />
                </div>
                <div>
                  <div className="drc-region">Sydney · ap-southeast-2</div>
                  <div className="drc-coords">33.8688&deg; S &nbsp;·&nbsp; 151.2093&deg; E</div>
                </div>
              </div>
            </div>
          </div>

          <ol className="why-local-points reveal">
            {POINTS.map((p, i) => (
              <li key={p.title}>
                <span className="wl-num">{String(i + 1).padStart(2, '0')}</span>
                <div className="wl-body">
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
