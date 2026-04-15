/**
 * Next.js instrumentation hook — loads Sentry on the right runtime.
 * Runs once per server / edge process before any request is served.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(
  ...args: Parameters<
    typeof import('@sentry/nextjs').captureRequestError
  >
) {
  const { captureRequestError } = await import('@sentry/nextjs')
  return captureRequestError(...args)
}
