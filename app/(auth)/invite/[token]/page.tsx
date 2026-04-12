import { createClient as createServiceClient } from '@supabase/supabase-js'
import InviteForm from './invite-form'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params

  // Use service client to bypass RLS — invite page is public (user not logged in)
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // Validate invite token — must be unused and not expired
  const { data: invite, error } = await supabase
    .from('clinic_invites')
    .select('id, email, role, clinic_id, expires_at, clinics(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .single()

  const isExpired = invite ? new Date(invite.expires_at) < new Date() : false
  const isInvalid = error || !invite || isExpired

  const clinicName =
    (invite?.clinics as { name?: string } | null)?.name ?? 'your clinic'

  // ── Expired / invalid state ──
  if (isInvalid) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#FAF8F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          {/* Logo */}
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              color: '#1B6B4A',
              marginBottom: '2.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            ClinicForce
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #E8E4DE',
              borderRadius: 16,
              padding: '2.5rem',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '1.75rem',
                fontWeight: 400,
                color: '#1A1A1A',
                lineHeight: 1.25,
                marginBottom: '0.75rem',
              }}
            >
              Invite link expired
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.925rem',
                color: '#6B6B6B',
                lineHeight: 1.6,
              }}
            >
              This invite link has expired or is no longer valid.
              <br />
              Contact your ClinicForce administrator for a new invite.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Valid invite ── render form ──
  return (
    <InviteForm
      token={token}
      email={invite.email}
      clinicName={clinicName}
      clinicId={invite.clinic_id}
      role={invite.role}
    />
  )
}
