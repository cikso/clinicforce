import Link from 'next/link'

/**
 * Wizard finale. Celebrates setup completion and lands the user in the
 * dashboard. Rendered inside the wizard layout (OnboardingShell), so the
 * progress bar is hidden by the shell for this step.
 */
export default function OnboardingCompletePage() {
  const CHECKLIST = [
    'Clinic details saved',
    'Opening hours configured',
    'Call handling configured',
    'Urgent triage rules set',
  ]

  const NEXT_STEPS: Array<{ label: string; description: string; href: string }> = [
    {
      label: 'Open your Command Centre',
      description: 'See live calls, urgent cases, and today\u2019s bookings at a glance.',
      href: '/overview',
    },
    {
      label: 'Invite your team',
      description: 'Bring on nurses, vets, and reception so everyone can triage together.',
      href: '/settings/team',
    },
    {
      label: 'Review call handling settings',
      description: 'Fine-tune how Stella answers, routes, and escalates calls.',
      href: '/settings/ai',
    },
  ]

  return (
    <div className="cf-onb-complete">
      {/* Success icon */}
      <div className="cf-onb-complete-icon" aria-hidden>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>

      {/* Heading */}
      <p className="cf-onb-complete-eyebrow">Setup complete</p>
      <h1 className="cf-onb-complete-heading">You&rsquo;re all set up</h1>
      <p className="cf-onb-complete-subtitle">
        Your AI receptionist is configured and ready to take calls. Head to your dashboard to go live.
      </p>

      {/* Checklist */}
      <div className="cf-onb-complete-card">
        <p className="cf-onb-complete-card-heading">Wizard summary</p>
        <ul className="cf-onb-complete-list">
          {CHECKLIST.map((item, i) => (
            <li
              key={item}
              className="cf-onb-complete-row"
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              <span className="cf-onb-complete-check" aria-hidden>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <span className="cf-onb-complete-row-text">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Primary CTA */}
      <Link href="/overview" className="cf-onb-complete-cta">
        Go to dashboard
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Next steps */}
      <div className="cf-onb-complete-next">
        <p className="cf-onb-complete-next-heading">What to do next</p>
        <ul className="cf-onb-complete-next-list">
          {NEXT_STEPS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="cf-onb-complete-next-row">
                <span>
                  <span className="cf-onb-complete-next-label">{item.label}</span>
                  <span className="cf-onb-complete-next-desc">{item.description}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cf-onb-complete-next-arrow">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="cf-onb-complete-footnote">
        You can update these settings anytime from Settings.
      </p>

      {/* Scoped styles */}
      <style>{`
        @keyframes cf-onb-pop {
          0%   { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes cf-onb-row-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cf-onb-complete {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          font-family: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
          color: var(--text-primary);
        }

        .cf-onb-complete-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--brand-light);
          border: 2px solid rgba(0, 214, 143, 0.3);
          color: var(--brand-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          animation: cf-onb-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        .cf-onb-complete-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brand-dark);
          margin: 0 0 8px;
        }

        .cf-onb-complete-heading {
          font-family: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: var(--text-primary);
          margin: 0 0 10px;
        }

        .cf-onb-complete-subtitle {
          font-size: 15px;
          line-height: 1.55;
          color: var(--text-secondary);
          margin: 0 0 30px;
          max-width: 440px;
        }

        .cf-onb-complete-card {
          width: 100%;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 20px 22px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-card);
          text-align: left;
        }
        .cf-onb-complete-card-heading {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin: 0 0 12px;
        }
        .cf-onb-complete-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cf-onb-complete-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-top: 1px solid var(--border-subtle);
          opacity: 0;
          animation: cf-onb-row-in 320ms cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .cf-onb-complete-row:first-child { border-top: none; }
        .cf-onb-complete-check {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--brand);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cf-onb-complete-row-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .cf-onb-complete-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          max-width: 360px;
          padding: 14px 24px;
          background: var(--brand);
          color: white;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 700;
          text-decoration: none;
          letter-spacing: 0.005em;
          box-shadow: 0 4px 12px rgba(0, 214, 143, 0.24);
          transition: background-color 140ms ease, transform 90ms ease, box-shadow 140ms ease;
        }
        .cf-onb-complete-cta:hover {
          background: var(--brand-hover);
          box-shadow: 0 6px 16px rgba(0, 214, 143, 0.3);
        }
        .cf-onb-complete-cta:active {
          transform: scale(0.985);
        }

        .cf-onb-complete-next {
          width: 100%;
          margin-top: 36px;
          text-align: left;
        }
        .cf-onb-complete-next-heading {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin: 0 0 10px;
          padding-left: 4px;
        }
        .cf-onb-complete-next-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .cf-onb-complete-next-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 10px;
          text-decoration: none;
          transition: border-color 140ms ease, background-color 140ms ease;
        }
        .cf-onb-complete-next-row:hover {
          border-color: var(--border);
          background: var(--bg-hover);
        }
        .cf-onb-complete-next-label {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .cf-onb-complete-next-desc {
          display: block;
          font-size: 12.5px;
          line-height: 1.45;
          color: var(--text-secondary);
        }
        .cf-onb-complete-next-arrow {
          color: var(--text-tertiary);
          flex-shrink: 0;
          transition: color 140ms ease, transform 140ms ease;
        }
        .cf-onb-complete-next-row:hover .cf-onb-complete-next-arrow {
          color: var(--brand);
          transform: translateX(2px);
        }

        .cf-onb-complete-footnote {
          font-size: 12.5px;
          color: var(--text-tertiary);
          margin: 22px 0 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .cf-onb-complete-icon,
          .cf-onb-complete-row { animation: none; opacity: 1; transform: none; }
          .cf-onb-complete-cta,
          .cf-onb-complete-next-row,
          .cf-onb-complete-next-arrow { transition: none; }
        }
      `}</style>
    </div>
  )
}
