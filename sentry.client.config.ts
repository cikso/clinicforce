import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development',
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.05),
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  })
}
