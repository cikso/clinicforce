import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVertical } from '@/lib/verticals'

const DEFAULT_DYNAMIC_VARIABLES = {
  clinic_name: 'Baulkham Hills Veterinary Hospital',
  subject_label: 'pet',
} as const

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.startsWith('61') && digits.length === 11) {
    return `0${digits.slice(2)}`
  }

  return digits
}

function getSubjectLabel(vertical: unknown): string {
  const key = typeof vertical === 'string' ? vertical : 'vet'
  const config = getVertical(key)

  if (config.key === 'vet') return 'pet'
  return config.patientLabel.toLowerCase()
}

async function extractToNumber(req: NextRequest): Promise<string | null> {
  const queryTo =
    req.nextUrl.searchParams.get('called_number') ??
    req.nextUrl.searchParams.get('calledNumber') ??
    req.nextUrl.searchParams.get('to') ??
    req.nextUrl.searchParams.get('To')

  if (queryTo) return queryTo

  const contentType = req.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const body = (await req.json()) as Record<string, unknown>
    const value =
      body.called_number ??
      body.calledNumber ??
      body.to ??
      body.To
    return typeof value === 'string' ? value : null
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await req.formData()
    const value =
      form.get('called_number') ??
      form.get('calledNumber') ??
      form.get('to') ??
      form.get('To')
    return typeof value === 'string' ? value : null
  }

  return null
}

async function handleInitiate(req: NextRequest) {
  const rawTo = await extractToNumber(req)
  let dynamic_variables = DEFAULT_DYNAMIC_VARIABLES

  try {
    const normalisedTo = rawTo ? normalisePhone(rawTo) : ''

    if (normalisedTo) {
      const supabase = getSupabase()
      const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')

      if (error) {
        console.error('[/api/initiate] Failed to load clinics:', error)
      } else {
        const clinic = (clinics ?? []).find((row) => {
          const phone = typeof row.phone === 'string' ? row.phone : ''
          return normalisePhone(phone) === normalisedTo
        })

        if (clinic) {
          dynamic_variables = {
            clinic_name: clinic.name ?? DEFAULT_DYNAMIC_VARIABLES.clinic_name,
            subject_label: getSubjectLabel(clinic.vertical),
          }
        } else {
          console.warn(`[/api/initiate] No clinic found for to number: ${rawTo}`)
        }
      }
    } else {
      console.warn('[/api/initiate] Missing or invalid to number, using defaults')
    }
  } catch (error) {
    console.error('[/api/initiate] Unexpected error:', error)
  }

  return new NextResponse(
    JSON.stringify({
      type: 'conversation_initiation_client_data',
      dynamic_variables,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
}

export async function GET(req: NextRequest) {
  return handleInitiate(req)
}

export async function POST(req: NextRequest) {
  return handleInitiate(req)
}
