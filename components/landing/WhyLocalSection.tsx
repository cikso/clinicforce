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
              <div className="drc-map">
                <svg
                  viewBox="0 0 480 400"
                  role="img"
                  aria-label="Map of Australia with Sydney marked as the primary data centre"
                  className="drc-map-svg"
                >
                  {/* Mainland + Tasmania */}
                  <path
                    className="drc-map-outline"
                    d="M306 26 L310 40 L300 48 L290 55 L275 62 L260 68 L248 70 L240 65 L230 55 L218 50 L205 48 L196 52 L198 62 L186 68 L176 70 L162 75 L148 82 L135 92 L126 105 L118 118 L108 130 L96 150 L85 175 L75 195 L70 215 L70 240 L68 260 L63 278 L78 282 L95 285 L115 287 L140 288 L165 287 L195 285 L225 283 L240 280 L255 278 L262 290 L270 283 L272 283 L280 290 L290 292 L302 297 L312 305 L325 312 L340 310 L355 302 L365 293 L372 282 L376 268 L384 273 L392 258 L396 240 L400 220 L402 205 L400 188 L395 170 L388 150 L378 130 L365 108 L350 92 L338 75 L325 58 L315 42 Z M340 350 L350 348 L358 352 L362 360 L360 370 L354 375 L345 376 L338 372 L334 362 L336 354 Z"
                    fill="var(--bg-secondary)"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                  />
                  {/* Internal state borders (hinted) */}
                  <path
                    className="drc-map-borders"
                    d="M187 55 L187 283 M187 190 L292 190 M267 55 L267 190 M292 190 L292 289 M292 220 L402 220 M292 289 L370 289"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  <g className="drc-pin-group" transform="translate(384, 273)">
                    <circle className="drc-pin-ring" r="16" fill="none" strokeWidth="1" />
                    <circle className="drc-pin-halo" r="10" />
                    <circle className="drc-pin-core" r="5" />
                  </g>
                  <g className="drc-pin-label" transform="translate(384, 273)">
                    <text x="14" y="-4" className="drc-pin-city">Sydney</text>
                    <text x="14" y="12" className="drc-pin-role">Data centre</text>
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
