import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildBrainContext, Channel } from '@/lib/brain/orchestrator'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'

function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) }

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  clinicId: string
  message: string
  history?: ChatMessage[]
  channel?: Channel
}

export interface ChatResponse {
  reply: string
  triage: string
  clinicName: string
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getClinicProfile()
    if (!profile?.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ChatRequest = await req.json()
    const { message, history = [], channel = 'chat' } = body

    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    // Build the master brain context
    const brain = buildBrainContext(profile.clinicId, message, channel)

    // Assemble the message thread
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: brain.systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.3,
      max_tokens: 300,
    })

    const reply = completion.choices[0]?.message?.content ?? 'Sorry, I was unable to process that.'

    return NextResponse.json({
      reply,
      triage: brain.triage,
      clinicName: brain.clinicName,
    } satisfies ChatResponse)
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
