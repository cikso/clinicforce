import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getClinicProfile } from '@/lib/supabase/auth-helpers'
import ConversationsShell from '@/app/components/conversations/ConversationsShell'
import { ConversationsSkeleton } from '@/app/components/ui/Skeleton'
import { Suspense } from 'react'

export const metadata: Metadata = { title: 'Call Inbox — ClinicForce' }
export const dynamic = 'force-dynamic'

async function ConversationsContent() {
  const profile = await getClinicProfile()
  const clinicId = profile?.clinicId ?? ''

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const db = serviceKey
    ? createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        { auth: { autoRefreshToken: false, persistSession: false } },
      )
    : await createClient()

  // Fetch first 20 calls
  const { data: calls } = clinicId
    ? await db
        .from('call_inbox')
        .select('id, caller_name, caller_phone, pet_name, pet_species, summary, ai_detail, action_required, urgency, status, coverage_reason, call_duration_seconds, industry_data, elevenlabs_conversation_id, created_at')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  // Fetch clinic info
  const { data: clinicData } = clinicId
    ? await db
        .from('clinics')
        .select('name, vertical, industry_config')
        .eq('id', clinicId)
        .maybeSingle()
    : { data: null }

  const clinicRecord = clinicData as { name?: string; vertical?: string; industry_config?: Record<string, unknown> } | null
  const industryConfig = clinicRecord?.industry_config ?? null
  const extraFields = (industryConfig as { extra_fields?: unknown[] } | null)?.extra_fields
  const hasExtraFields = Array.isArray(extraFields) && extraFields.length > 0
  const clinicName = clinicRecord?.name ?? ''
  const clinicVertical = clinicRecord?.vertical ?? 'vet'

  type CallRow = {
    id: string
    caller_name: string
    caller_phone: string
    pet_name: string | null
    pet_species: string | null
    summary: string
    ai_detail: string | null
    action_required: string | null
    urgency: string
    status: string
    coverage_reason: string | null
    call_duration_seconds: number | null
    industry_data: Record<string, unknown> | null
    elevenlabs_conversation_id: string | null
    created_at: string
  }

  return (
    <ConversationsShell
      initialCalls={(calls ?? []) as CallRow[]}
      hasExtraFields={hasExtraFields}
      clinicId={clinicId}
      clinicName={clinicName}
      clinicVertical={clinicVertical}
    />
  )
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<ConversationsSkeleton />}>
      <ConversationsContent />
    </Suspense>
  )
}
