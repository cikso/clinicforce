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
                  <path
                    className="drc-map-outline"
                    d="M92 182 C84 170 76 160 78 146 C82 128 100 120 118 124 C130 126 142 132 154 130 C166 128 174 118 186 116 C200 114 212 122 226 118 C238 114 244 102 256 100 C272 98 286 108 302 108 C318 108 332 100 346 106 C360 112 368 126 382 130 C398 134 414 130 424 142 C434 154 432 172 428 186 C424 200 414 212 406 224 C398 236 394 250 382 258 C370 266 354 264 344 274 C334 284 336 300 326 310 C316 320 300 322 288 316 C276 310 270 296 258 292 C244 288 228 294 216 288 C202 282 196 268 184 262 C170 256 152 258 138 252 C122 246 108 232 100 218 C94 208 96 194 92 182 Z M352 334 C348 328 352 320 360 318 C368 316 376 322 376 330 C376 338 368 342 360 340 C356 338 354 336 352 334 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <g className="drc-pin-group" transform="translate(394, 248)">
                    <circle className="drc-pin-ring" r="16" fill="none" strokeWidth="1" />
                    <circle className="drc-pin-halo" r="10" />
                    <circle className="drc-pin-core" r="5" />
                  </g>
                  <g className="drc-pin-label" transform="translate(394, 248)">
                    <text x="14" y="-6" className="drc-pin-city">Sydney</text>
                    <text x="14" y="10" className="drc-pin-role">Data centre</text>
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
