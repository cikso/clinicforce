import PageShell from '@/components/layout/PageShell'
import ReferralsClient from '@/components/referrals/ReferralsClient'

export default function ReferralsPage() {
  return (
    <PageShell
      title="Referral Hub"
      subtitle="Coordinating emergency care with 24/7 partners"
      clinicName="Downtown Emergency"
    >
      <ReferralsClient />
    </PageShell>
  )
}
