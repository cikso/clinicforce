import { tasks } from '@trigger.dev/sdk/v3'

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
    await tasks.trigger('notify-error', {
      label,
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[notifySlack] Failed to trigger notify-error task:', e instanceof Error ? e.message : e)
  }
}
