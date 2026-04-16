import * as Sentry from '@sentry/nextjs'
import { scrubEvent } from './lib/observability/scrub'

/**
 * Server & edge runtime Sentry initialisation.
 *
 * Next 16 convention: instrumentation.ts at repo root. register() runs once per
 * server instance before any request is handled.
 *
 * onRequestError is the official way to pipe App Router render / route handler
 * / server action errors to Sentry without wrapping every route by hand.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return // lets local dev run without a DSN

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      // We ship health-related transcripts. Keep PII out of Sentry by default —
      // scrub in beforeSend rather than relying on sendDefaultPii.
      sendDefaultPii: false,
      // Tracing is OFF until beforeSendTransaction / beforeSendSpan are wired.
      // Performance events include URL + span metadata that bypass beforeSend.
      tracesSampleRate: 0,
      beforeSend: scrubEvent,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
