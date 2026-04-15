/**
 * Sentry server-side init. Loaded by instrumentation.ts for Node runtime.
 *
 * No DSN => no-op. That lets `next build` succeed on PR previews without
 * needing Sentry credentials, and local dev stays quiet.
 */

import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? 0),
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    // Scrub common PII from events and breadcrumbs before sending.
    beforeSend(event) {
      if (event.request?.cookies) delete event.request.cookies
      if (event.request?.headers) {
        delete event.request.headers.cookie
        delete event.request.headers.authorization
        delete event.request.headers['x-api-secret']
        delete event.request.headers['elevenlabs-signature']
      }
      return event
    },
  })
}
