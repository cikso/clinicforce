// Required env var: SLACK_ALERT_WEBHOOK_URL (optional — alerts are silently
// skipped if not set)

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
  const webhookUrl = process.env.SLACK_ALERT_WEBHOOK_URL
  if (!webhookUrl) {
    console.error(`[notifySlack] SLACK_ALERT_WEBHOOK_URL not set — skipping alert for: ${label}`)
    return
  }

  const msg = error instanceof Error ? error.message : String(error)

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 ClinicForce API error — ${label}: ${msg}\nEnv: production\nTime: ${new Date().toISOString()}`,
      }),
    })
  } catch (e) {
    console.error('[notifySlack] Failed to send Slack alert:', e instanceof Error ? e.message : e)
  }
}
