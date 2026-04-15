import { NextResponse } from 'next/server'
import type { z } from 'zod'

/**
 * Turn a ZodError into a safe 400 JSON response.
 * Field issues are exposed; internal paths/stack traces are not.
 */
export function badRequest(err: z.ZodError): NextResponse {
  const issues = err.issues.map(i => ({
    path: i.path.join('.'),
    message: i.message,
  }))
  return NextResponse.json(
    { error: 'Invalid request', issues },
    { status: 400 },
  )
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
    }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, response: badRequest(parsed.error) }
  }
  return { ok: true, data: parsed.data }
}
