import { Resend } from 'resend'

// Lazy init — the Resend SDK throws in its constructor when RESEND_API_KEY is
// missing. Evaluating this at module top-level broke `next build`'s page-data
// collection in CI (only Supabase vars are provided there). Keep construction
// inside the request-handling functions so build-time imports don't need it.
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

const FROM_ADDRESS = 'ClinicForce <admin@clinicforce.io>'

// ── Welcome email (for Team page direct account creation) ────────────────
export async function sendWelcomeEmail({
  to,
  name,
  clinicName,
  loginUrl,
  role,
}: {
  to: string
  name: string
  clinicName: string
  loginUrl: string
  role: string
}) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to ClinicForce</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00D68F;border-radius:12px;padding:10px 20px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ClinicForce</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 40px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111827;">
                Welcome to ClinicForce, ${name}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
                Your account has been created for <strong style="color:#374151;">${clinicName}</strong>
                as <strong style="color:#374151;">${role}</strong>.
                Click the button below to set your password and log in.
              </p>

              <hr style="border:none;border-top:1px solid #F3F4F6;margin:0 0 28px;" />

              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#00D68F;border-radius:10px;">
                    <a
                      href="${loginUrl}"
                      style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;"
                    >
                      Set password & sign in →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">Or copy this link:</p>
              <p style="margin:0;font-size:12px;color:#00D68F;word-break:break-all;">${loginUrl}</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
                This link expires in 24 hours. If you weren't expecting this, ignore it.
              </p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">
                © ${new Date().getFullYear()} ClinicForce · clinicforce.io
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: [to],
    subject: 'Welcome to ClinicForce — set up your account',
    html,
  })
}

// ── Branded invite email ──────────────────────────────────────────────────
export async function sendInviteEmail({
  to,
  clinicName,
  inviteUrl,
  invitedBy,
  role,
}: {
  to: string
  clinicName: string
  inviteUrl: string
  invitedBy: string
  role: string
}) {
  const roleFmt =
    role === 'clinic_owner' ? 'Owner'
    : role === 'clinic_admin' ? 'Admin'
    : role === 'platform_owner' ? 'Platform Owner'
    : 'Staff'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ClinicForce</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo / brand -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#00D68F;border-radius:12px;padding:10px 20px;">
                    <span style="font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                      ClinicForce
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 40px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

              <!-- Heading -->
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:700;color:#111827;line-height:1.2;">
                You're invited to join ${clinicName}
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
                <strong style="color:#374151;">${invitedBy}</strong> has invited you to access
                the <strong style="color:#374151;">${clinicName}</strong> workspace on ClinicForce
                as <strong style="color:#374151;">${roleFmt}</strong>.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #F3F4F6;margin:0 0 28px;" />

              <!-- What is ClinicForce -->
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;text-transform:uppercase;letter-spacing:0.05em;">
                What is ClinicForce?
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.6;">
                ClinicForce is an AI-powered operations dashboard that handles inbound calls,
                manages your care queue, and streamlines your clinic's day-to-day.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#00D68F;border-radius:10px;">
                    <a
                      href="${inviteUrl}"
                      style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;"
                    >
                      Accept invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
                Or copy this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#00D68F;word-break:break-all;">
                ${inviteUrl}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9CA3AF;">
                This invite expires in 7 days. If you weren't expecting this, you can safely ignore it.
              </p>
              <p style="margin:0;font-size:12px;color:#D1D5DB;">
                © ${new Date().getFullYear()} ClinicForce · clinicforce.io
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`

  await getResend().emails.send({
    from: FROM_ADDRESS,
    to: [to],
    subject: `You've been invited to join ${clinicName} on ClinicForce`,
    html,
  })
}
