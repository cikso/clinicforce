import { NextResponse, type NextRequest } from 'next/server'

// Auth disabled — all routes open
export function proxy(request: NextRequest) {
  return NextResponse.next()
}
