import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SecurityClient from './SecurityClient'

export const metadata: Metadata = { title: 'Security — ClinicForce' }
export const dynamic = 'force-dynamic'

type Factor = {
  id: string
  friendly_name?: string | null
  factor_type: string
  status: string
  created_at: string
}

export default async function SecurityPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.auth.mfa.listFactors()
  const factors: Factor[] = (data?.all ?? []).filter(f => f.factor_type === 'totp') as Factor[]

  return <SecurityClient initialFactors={factors} />
}
