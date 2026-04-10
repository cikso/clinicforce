interface RetryOptions {
  retries?: number
  delayMs?: number
  label?: string
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const { retries = 3, delayMs = 300, label = 'unknown' } = options ?? {}

  let lastError: unknown

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[withRetry] ${label} — attempt ${attempt}/${retries} failed: ${msg}`)

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt - 1)))
      }
    }
  }

  await notifySlack(label, lastError)
  throw lastError
}

export async function notifySlack(label: string, error: unknown): Promise<void> {
  try {
    // Dynamic import avoids bundling @trigger.dev/sdk into the Next.js
    // Turbopack build — the SDK is heavy (OpenTelemetry, ws, etc.) and
    // only the Trigger.dev CLI should bundle it. The module specifier is
    // built at runtime so TypeScript doesn't try to resolve the types
    // during the Next.js type-check pass.
    const sdkPath = ['@trigger.dev', 'sdk', 'v3'].join('/')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { tasks } = await (import(sdkPath) as Promise<any>)
    await tasks.trigger('notify-error', {
      label,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[notifySlack] Failed to trigger notify-error task:', e instanceof Error ? e.message : e)
  }
}
