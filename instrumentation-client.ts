import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from './lib/observability/scrub'

/**
 * Browser Sentry initialisation.
 *
 * Next 16 convention: instrumentation-client.ts at repo root runs after the
 * HTML document is loaded but before React hydration starts — earliest point
 * we can catch errors and navigation events.
 *
 * We intentionally omit Replay and BrowserTracing integrations for launch —
 * they can send screenshots / full DOM that would leak caller and patient
 * information. Revisit after the data-handling review.
 */

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    beforeSend: scrubEvent,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
