import { NextRequest, NextResponse } from 'next/server'

export const preferredRegion = 'syd1'

/**
 * GET /api/debug/conversation?id=CONVERSATION_ID
 *
 * Temporary debug route to inspect ElevenLabs conversation response structure.
 * Remove after investigation.
 */
export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get('id')

  if (!conversationId) {
    // List recent conversations instead
    const listRes = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations?page_size=5',
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      },
    )
    const listData = await listRes.json()
    return NextResponse.json({ recent_conversations: listData })
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
    },
  )

  const data = await res.json()

  // Log the full structure
  console.log('[debug/conversation] Full response keys:', JSON.stringify({
    top_keys: Object.keys(data),
    analysis_keys: data.analysis ? Object.keys(data.analysis) : null,
    analysis: data.analysis ?? null,
    summary: data.summary ?? null,
    transcript_summary: data.transcript_summary ?? null,
  }))

  return NextResponse.json(data)
}
