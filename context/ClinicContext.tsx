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
  /** True for platform_owner OR clinic_owner — anyone with a multi-clinic UX. */
  isMultiClinic: boolean
  industryConfig: IndustryConfig
  /** Pass null to clear the active clinic (return to portfolio / all-clinics view). */
  switchClinic: (clinicId: string | null) => void
}

const ClinicContext = createContext<ClinicContextValue>({
  clinics: [],
  activeClinicId: '',
  activeClinicName: '',
  isPlatformOwner: false,
  isMultiClinic: false,
  industryConfig: null,
  switchClinic: () => {},
})

export function ClinicProvider({
  clinics,
  activeClinicId: initialClinicId,
  activeClinicName: initialClinicName,
  isPlatformOwner,
  isMultiClinic,
  industryConfig = null,
  children,
}: {
  clinics: ClinicOption[]
  activeClinicId: string
  activeClinicName: string
  isPlatformOwner: boolean
  isMultiClinic: boolean
  industryConfig?: IndustryConfig
  children: ReactNode
}) {
  const router = useRouter()
  const [activeClinicId, setActiveClinicId] = useState(initialClinicId)
  const [activeClinicName, setActiveClinicName] = useState(initialClinicName)

  const switchClinic = useCallback(
    (clinicId: string | null) => {
      if (clinicId === null) {
        // Portfolio mode: clear active clinic
        setActiveClinicId('')
        setActiveClinicName('')
      } else {
        const clinic = clinics.find(c => c.id === clinicId)
        if (!clinic) return
        setActiveClinicId(clinicId)
        setActiveClinicName(clinic.name)
      }

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
      value={{ clinics, activeClinicId, activeClinicName, isPlatformOwner, isMultiClinic, industryConfig, switchClinic }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  return useContext(ClinicContext)
}
