import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface TriageRequest {
  patientName: string
  species: string
  breed: string
  age: string
  presentingIssue: string
  ownerDescription?: string
}

export interface TriageResult {
  urgency: 'CRITICAL' | 'URGENT' | 'ROUTINE'
  urgencyScore: number
  riskFactor: string
  aiSummary: string
  aiJustification: string
  recommendedActions: string[]
}

const SYSTEM_PROMPT = `You are Sarah, an AI veterinary triage specialist at an emergency animal hospital.
Your role is to assess incoming patient cases and provide accurate, clinically-sound urgency classifications.

You must respond with a single valid JSON object — no markdown, no explanation, just the JSON.

Urgency definitions:
- CRITICAL (score 8-10): Immediate life-threatening emergency. Requires immediate intervention. Examples: respiratory distress, collapse, uncontrolled bleeding, toxin ingestion (severe), GDV, anaphylaxis, blocked bladder (male cat), seizure, trauma.
- URGENT (score 5-7.9): Serious condition requiring prompt attention within 1-2 hours. Examples: moderate pain, vomiting/diarrhoea (multiple episodes), suspected fracture, eye injuries, urinary straining (female), suspected toxin (mild-moderate).
- ROUTINE (score 1-4.9): Non-emergency, can wait for a scheduled appointment. Examples: mild limping, routine check, minor skin issues, single vomit episode with normal behaviour.

Always consider:
- Species-specific risks (e.g. urinary blockage in male cats is CRITICAL, not URGENT)
- Age-related vulnerability (elderly and very young animals escalate one level)
- Symptom combinations that suggest systemic involvement
- Australian context for toxins (e.g. cane toad, snake, tick paralysis)

Respond with this exact JSON structure:
{
  "urgency": "CRITICAL" | "URGENT" | "ROUTINE",
  "urgencyScore": <number 1.0-10.0>,
  "riskFactor": "<primary risk category, e.g. 'GDV / Cardiovascular', 'Theobromine Toxicity', 'Urethral Obstruction'>",
  "aiSummary": "<1 sentence clinical summary, max 12 words>",
  "aiJustification": "<2-3 sentence clinical justification explaining your reasoning and recommended immediate actions>",
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"]
}`

export async function POST(req: NextRequest) {
  try {
    const body: TriageRequest = await req.json()
    const { patientName, species, breed, age, presentingIssue, ownerDescription } = body

    if (!patientName || !species || !presentingIssue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userMessage = `
Patient: ${patientName}
Species: ${species}
Breed: ${breed || 'Unknown'}
Age: ${age || 'Unknown'}
Presenting issue: ${presentingIssue}
${ownerDescription ? `Owner description: ${ownerDescription}` : ''}
    `.trim()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) throw new Error('Empty response from OpenAI')

    const result: TriageResult = JSON.parse(raw)

    // Validate shape
    if (!result.urgency || !result.urgencyScore || !result.riskFactor) {
      throw new Error('Invalid triage result structure')
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('Triage API error:', err)
    return NextResponse.json({ error: 'Triage analysis failed' }, { status: 500 })
  }
}
