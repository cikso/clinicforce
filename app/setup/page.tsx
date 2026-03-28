'use client'

import { useEffect } from 'react'

// Authenticated user with no clinic — send them to login to complete setup
export default function SetupPage() {
  useEffect(() => {
    window.location.href = '/login'
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
      <p className="text-sm text-slate-500">Redirecting to setup...</p>
    </div>
  )
}
