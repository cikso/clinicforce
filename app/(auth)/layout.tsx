import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ClinicForce — Sign In',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#FAF8F4',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {children}
      </div>
    </>
  )
}
