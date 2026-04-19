'use client'

import rawAustraliaMap from '@svg-maps/australia'

type SvgMap = {
  label: string
  viewBox: string
  locations: { id: string; name: string; path: string }[]
}
const australiaMap = rawAustraliaMap as SvgMap

type LocalPoint = { title: string; body: string }

// Pin position in the package's viewBox (6.5 4.8 273 252.8), projected
// from Sydney lat/long to land on the NSW east coast.
const SYDNEY_X = 272
const SYDNEY_Y = 175

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
              Australian infrastructure. When something breaks, you ring Sydney.
            </p>

            <div className="data-region-card">
              <div className="drc-label">Data Centre</div>
              <div className="drc-map">
                <svg
                  viewBox={australiaMap.viewBox}
                  role="img"
                  aria-label="Map of Australia with Sydney marked as the primary data centre"
                  className="drc-map-svg"
                >
                  {australiaMap.locations.map((loc) => (
                    <path
                      key={loc.id}
                      className="drc-map-state"
                      d={loc.path}
                      fill="var(--drc-land-fill)"
                      stroke="currentColor"
                      strokeWidth="0.6"
                      strokeLinejoin="round"
                    />
                  ))}
                  <g className="drc-pin-group" transform={`translate(${SYDNEY_X}, ${SYDNEY_Y})`}>
                    <circle className="drc-pin-ring" r="9" fill="none" strokeWidth="0.6" />
                    <circle className="drc-pin-halo" r="5.5" />
                    <circle className="drc-pin-core" r="2.6" />
                  </g>
                  <g className="drc-pin-label" transform={`translate(${SYDNEY_X}, ${SYDNEY_Y})`}>
                    <text x="7" y="2" className="drc-pin-city">Sydney</text>
                  </g>
                </svg>
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
