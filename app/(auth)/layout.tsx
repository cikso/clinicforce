import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClinicForce — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white font-body">
      {children}
    </div>
  )
}
