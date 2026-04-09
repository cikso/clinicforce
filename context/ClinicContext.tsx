'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface ClinicOption {
  id: string
  name: string
  vertical: string
}

export type IndustryConfig = Record<string, unknown> | null

interface ClinicContextValue {
  clinics: ClinicOption[]
  activeClinicId: string
  activeClinicName: string
  isPlatformOwner: boolean
  industryConfig: IndustryConfig
  switchClinic: (clinicId: string) => void
}

const ClinicContext = createContext<ClinicContextValue>({
  clinics: [],
  activeClinicId: '',
  activeClinicName: '',
  isPlatformOwner: false,
  industryConfig: null,
  switchClinic: () => {},
})

export function ClinicProvider({
  clinics,
  activeClinicId: initialClinicId,
  activeClinicName: initialClinicName,
  isPlatformOwner,
  industryConfig = null,
  children,
}: {
  clinics: ClinicOption[]
  activeClinicId: string
  activeClinicName: string
  isPlatformOwner: boolean
  industryConfig?: IndustryConfig
  children: ReactNode
}) {
  const router = useRouter()
  const [activeClinicId, setActiveClinicId] = useState(initialClinicId)
  const [activeClinicName, setActiveClinicName] = useState(initialClinicName)

  const switchClinic = useCallback(
    (clinicId: string) => {
      const clinic = clinics.find(c => c.id === clinicId)
      if (!clinic) return

      setActiveClinicId(clinicId)
      setActiveClinicName(clinic.name)

      fetch('/api/clinic-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId }),
      })
        .then(() => router.refresh())
        .catch(() => {})
    },
    [clinics, router],
  )

  return (
    <ClinicContext.Provider
      value={{ clinics, activeClinicId, activeClinicName, isPlatformOwner, industryConfig, switchClinic }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  return useContext(ClinicContext)
}
