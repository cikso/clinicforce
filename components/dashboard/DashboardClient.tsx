'use client'

import { useState, useCallback } from 'react'
import {
  INITIAL_CASES, INITIAL_CALLS, INITIAL_CAPACITY, INITIAL_ACTIVITY,
  CLINICIANS, DashboardCase, DashboardCall, ActivityItem, ClinicCapacity, Clinician,
} from '@/data/mock-dashboard'
import { Activity, AlertTriangle, Calendar, Clock, Users } from 'lucide-react'
import { formatDashboardDate } from '@/lib/formatters'

import PageShell from '@/components/layout/PageShell'
import KpiCard from './KpiCard'
import UrgentCasesTable from './UrgentCasesTable'
import CaseDetailDrawer from './CaseDetailDrawer'
import AiWatchlistPanel from './AiWatchlistPanel'
import AfterHoursCallsPanel from './AfterHoursCallsPanel'
import ClinicCapacityCard from './ClinicCapacityCard'
import QuickActionsPanel from './QuickActionsPanel'
import ActivityFeed from './ActivityFeed'
import NewCaseModal from './NewCaseModal'
import AssignClinicianModal from './AssignClinicianModal'
import EscalateModal from './EscalateModal'
import ToastContainer, { ToastItem } from './ToastContainer'

export default function DashboardClient() {
  // ─── Core state ────────────────────────────────────────────
  const [cases, setCases] = useState<DashboardCase[]>(INITIAL_CASES)
  const [calls, setCalls] = useState<DashboardCall[]>(INITIAL_CALLS)
  const [capacity, setCapacity] = useState<ClinicCapacity>(INITIAL_CAPACITY)
  const [activity, setActivity] = useState<ActivityItem[]>(INITIAL_ACTIVITY)

  // ─── UI state ───────────────────────────────────────────────
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [showNewCase, setShowNewCase] = useState(false)
  const [assignCaseId, setAssignCaseId] = useState<string | null>(null)
  const [escalateCaseId, setEscalateCaseId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  // ─── Derived ─────────────────────────────────────────────────
  const pendingTriage = cases.filter((c) => c.status === 'WAITING').length
  const emergencyCases = cases.filter((c) => c.urgency === 'CRITICAL').length
  const avgWait = cases.length ? Math.round(cases.reduce((s, c) => s + c.waitMinutes, 0) / cases.length) : 0
  const watchlistCases = cases.filter((c) => c.urgency === 'CRITICAL' || c.urgencyScore >= 7)
  const availableClinicians = CLINICIANS.filter((c) => c.available).length

  // ─── Helpers ─────────────────────────────────────────────────
  const addToast = useCallback((message: string, variant: ToastItem['variant'] = 'success') => {
    const id = `t-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const logActivity = useCallback((message: string, type: ActivityItem['type']) => {
    setActivity((prev) =>
      [{ id: `a-${Date.now()}`, message, timestamp: new Date(), type }, ...prev].slice(0, 20)
    )
  }, [])

  // ─── Case actions ─────────────────────────────────────────────
  const handleCaseAction = useCallback(
    (caseId: string, action: string) => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return

      if (action === 'ESCALATE' || action === 'Escalate to ER' || action === 'Escalate to Emergency') {
        setEscalateCaseId(caseId)
        return
      }

      if (action === 'Admit to ER') {
        setEscalateCaseId(caseId)
        return
      }

      if (action === 'Triage Now') {
        setCases((prev) =>
          prev.map((x) => (x.id === caseId ? { ...x, status: 'IN_REVIEW' } : x))
        )
        logActivity(`${c.patientName} moved to In Review — triage initiated`, 'case')
        addToast(`${c.patientName} moved to active triage`, 'info')
        return
      }

      if (action === 'APPROVE' || action === 'Approve & Assign') {
        if (!c.clinician) {
          setAssignCaseId(caseId)
        } else {
          setCases((prev) =>
            prev.map((x) => (x.id === caseId ? { ...x, status: 'IN_TREATMENT' } : x))
          )
          logActivity(`${c.patientName} approved and moved to treatment`, 'case')
          addToast(`${c.patientName} approved`, 'success')
        }
        return
      }

      if (action === 'Authorize Emesis Protocol') {
        setCases((prev) =>
          prev.map((x) => (x.id === caseId ? { ...x, status: 'IN_TREATMENT' } : x))
        )
        logActivity(`Emesis protocol authorised for ${c.patientName}`, 'case')
        addToast(`Emesis protocol authorised — ${c.patientName}`, 'warning')
        return
      }

      if (action === 'Escalate for Review' || action === 'Notify ER Team') {
        setEscalateCaseId(caseId)
        return
      }

      // Fallback: open drawer
      setSelectedCaseId(caseId)
    },
    [cases, logActivity, addToast]
  )

  const handleEscalateConfirm = useCallback(
    (caseId: string) => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return
      setCases((prev) =>
        prev.map((x) => (x.id === caseId ? { ...x, urgency: 'CRITICAL', status: 'ESCALATED' } : x))
      )
      setCapacity((prev) => ({ ...prev, occupiedRooms: Math.min(prev.occupiedRooms + 1, prev.totalRooms) }))
      logActivity(`${c.patientName} ESCALATED to ER — ER team notified`, 'escalation')
      addToast(`${c.patientName} escalated to ER`, 'warning')
    },
    [cases, logActivity, addToast]
  )

  const handleAssignClinician = useCallback(
    (caseId: string, clinician: Clinician) => {
      const c = cases.find((x) => x.id === caseId)
      if (!c) return
      setCases((prev) =>
        prev.map((x) =>
          x.id === caseId
            ? { ...x, clinician: clinician.name, clinicianAvatar: clinician.avatar, status: x.status === 'WAITING' ? 'IN_REVIEW' : x.status }
            : x
        )
      )
      logActivity(`${clinician.name} assigned to ${c.patientName} (${c.caseRef})`, 'assignment')
      addToast(`${clinician.name} assigned to ${c.patientName}`, 'success')
    },
    [cases, logActivity, addToast]
  )

  // ─── Call actions ─────────────────────────────────────────────
  const handleCallAction = useCallback(
    (callId: string, action: string) => {
      const call = calls.find((x) => x.id === callId)
      if (!call) return

      if (action === 'CREATE_CASE') {
        const newCase: DashboardCase = {
          id: `case-${Date.now()}`,
          caseRef: `VD-${9930 + cases.length}`,
          patientName: call.patientName,
          species: call.species.includes('Parrot') || call.species.includes('Bird') ? 'Avian' : call.species.includes('Cat') || call.species.includes('Coon') ? 'Feline' : 'Canine',
          breed: call.species,
          age: 'Unknown',
          issue: `After-hours call — ${call.aiRiskLabel.toLowerCase()} priority`,
          urgency: call.aiRiskLabel === 'CRITICAL' ? 'CRITICAL' : call.aiRiskLabel === 'URGENT' ? 'URGENT' : 'ROUTINE',
          waitMinutes: call.receivedMinsAgo,
          aiSummary: call.aiNextStep,
          status: 'WAITING',
          clinician: null,
          clinicianAvatar: null,
          source: 'VOICE_AI',
          riskFactor: 'Converted from call',
          urgencyScore: call.aiRiskLabel === 'CRITICAL' ? 8.5 : call.aiRiskLabel === 'URGENT' ? 6.5 : 3.0,
          aiJustification: call.transcript,
          ownerName: call.callerName,
          ownerPhone: call.callerPhone,
          ownerAddress: 'Unknown',
          ownerAvatar: call.callerName.replace(/\s+/g, ''),
          createdAt: 'Just now',
        }
        setCases((prev) => [newCase, ...prev])
        setCalls((prev) => prev.map((x) => (x.id === callId ? { ...x, status: 'CASE_CREATED' } : x)))
        logActivity(`Sarah AI converted call to case — ${call.patientName} (${call.species})`, 'call')
        addToast(`Case created for ${call.patientName}`, 'success')
        return
      }

      if (action === 'SEND_TO_QUEUE') {
        setCalls((prev) => prev.map((x) => (x.id === callId ? { ...x, status: 'QUEUED' } : x)))
        logActivity(`${call.patientName} call sent to queue for follow-up`, 'call')
        addToast(`${call.patientName} added to follow-up queue`, 'info')
        return
      }

      if (action === 'MARK_CALLBACK') {
        setCalls((prev) => prev.map((x) => (x.id === callId ? { ...x, status: 'CALLBACK_MARKED' } : x)))
        logActivity(`Callback marked complete — ${call.callerName} / ${call.patientName}`, 'call')
        addToast(`Callback marked for ${call.patientName}`, 'success')
        return
      }

      if (action === 'ESCALATE') {
        setCalls((prev) => prev.map((x) => (x.id === callId ? { ...x, status: 'ESCALATED' } : x)))
        logActivity(`${call.patientName} call escalated to ER — ${call.aiRiskLabel}`, 'escalation')
        addToast(`${call.patientName} escalated from call`, 'warning')
      }
    },
    [calls, cases.length, logActivity, addToast]
  )

  // ─── New case ─────────────────────────────────────────────────
  const handleNewCase = useCallback(
    (partial: Partial<DashboardCase>) => {
      const newCase: DashboardCase = {
        id: `case-${Date.now()}`,
        caseRef: `VD-${9930 + cases.length}`,
        patientName: partial.patientName ?? 'Unknown',
        species: partial.species ?? 'Canine',
        breed: partial.breed ?? '',
        age: partial.age ?? '',
        issue: partial.issue ?? '',
        urgency: partial.urgency ?? 'URGENT',
        waitMinutes: 0,
        aiSummary: 'Manual intake — AI triage pending.',
        status: 'WAITING',
        clinician: null,
        clinicianAvatar: null,
        source: partial.source ?? 'FRONT_DESK',
        riskFactor: 'Pending AI triage',
        urgencyScore: partial.urgency === 'CRITICAL' ? 8.0 : partial.urgency === 'URGENT' ? 5.0 : 2.0,
        aiJustification: 'Case manually entered — AI triage analysis queued.',
        ownerName: partial.ownerName ?? '',
        ownerPhone: partial.ownerPhone ?? '',
        ownerAddress: '',
        ownerAvatar: (partial.ownerName ?? 'Unknown').replace(/\s+/g, ''),
        createdAt: 'Just now',
      }
      setCases((prev) => [newCase, ...prev])
      logActivity(`New case created — ${newCase.patientName} (${newCase.issue})`, 'case')
      addToast(`${newCase.patientName} added to queue`, 'success')
    },
    [cases.length, logActivity, addToast]
  )

  // ─── Book emergency slot ──────────────────────────────────────
  const handleBookSlot = useCallback(() => {
    setCapacity((prev) => ({
      ...prev,
      occupiedRooms: Math.min(prev.occupiedRooms + 1, prev.totalRooms),
      nextSlotTime: '3:00 PM',
    }))
    logActivity('Emergency slot reserved — 3:00 PM', 'system')
    addToast('Emergency slot reserved at 3:00 PM', 'success')
  }, [logActivity, addToast])

  // ─── Escalate (quick action, no specific case) ────────────────
  const handleGlobalEscalate = useCallback(() => {
    const criticalCase = cases.find((c) => c.urgency === 'CRITICAL')
    if (criticalCase) {
      setEscalateCaseId(criticalCase.id)
    } else {
      addToast('No critical cases currently in queue', 'info')
    }
  }, [cases, addToast])

  // ─── Global assign (opens drawer for first unassigned) ───────
  const handleGlobalAssign = useCallback(() => {
    const unassigned = cases.find((c) => !c.clinician)
    if (unassigned) {
      setAssignCaseId(unassigned.id)
    } else {
      addToast('All cases have clinicians assigned', 'info')
    }
  }, [cases, addToast])

  const escalateCaseName = escalateCaseId ? cases.find((c) => c.id === escalateCaseId)?.patientName : undefined

  return (
    <PageShell
      title="Clinical Command"
      subtitle={formatDashboardDate()}
      clinicName="Downtown Emergency"
      searchPlaceholder="Search cases, patients, or transcripts..."
      showAiBadge={true}
      onNewCase={() => setShowNewCase(true)}
    >
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <KpiCard
            title="Active Cases"
            value={cases.length}
            context="in queue"
            trend="+3"
            trendUp={true}
            icon={<Activity className="w-5 h-5" />}
            accentColor="blue"
          />
          <KpiCard
            title="Pending Triage"
            value={pendingTriage}
            context="cases waiting"
            trend={pendingTriage > 2 ? `${pendingTriage - 2} over SLA` : 'within SLA'}
            trendUp={pendingTriage <= 2}
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="amber"
          />
          <KpiCard
            title="Emergency Cases"
            value={emergencyCases}
            context="1 inbound referral"
            trend={`+${emergencyCases}`}
            trendUp={false}
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="red"
            pulse={emergencyCases > 0}
          />
          <KpiCard
            title="Avg Wait Time"
            value={`${avgWait}m`}
            context="vs prev shift"
            trend="-4m"
            trendUp={false}
            icon={<Clock className="w-5 h-5" />}
            accentColor="teal"
          />
          <KpiCard
            title="Clinicians On Duty"
            value={CLINICIANS.filter((c) => c.available).length + CLINICIANS.filter((c) => !c.available).length}
            context={`${availableClinicians} available`}
            trendNeutral={true}
            trend="2 available"
            icon={<Users className="w-5 h-5" />}
            accentColor="slate"
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left column — 8 cols */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <UrgentCasesTable
              cases={cases}
              selectedId={selectedCaseId}
              onSelectCase={setSelectedCaseId}
              onAction={handleCaseAction}
            />
            <AfterHoursCallsPanel
              calls={calls}
              onAction={handleCallAction}
            />
          </div>

          {/* Right column — 4 cols */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <AiWatchlistPanel
              cases={watchlistCases}
              onSelectCase={setSelectedCaseId}
              onAction={handleCaseAction}
            />
            <ClinicCapacityCard
              capacity={capacity}
              pendingCount={pendingTriage}
            />
            <QuickActionsPanel
              onNewCase={() => setShowNewCase(true)}
              onEscalate={handleGlobalEscalate}
              onAssign={handleGlobalAssign}
              onBookSlot={handleBookSlot}
            />
            <ActivityFeed activities={activity} />
          </div>
        </div>
      </div>

      {/* ── Case detail drawer ── */}
      <CaseDetailDrawer
        cases={cases}
        selectedId={selectedCaseId}
        clinicians={CLINICIANS}
        onClose={() => setSelectedCaseId(null)}
        onAction={handleCaseAction}
        onAssign={(id) => { setSelectedCaseId(null); setAssignCaseId(id) }}
      />

      {/* ── Modals ── */}
      <NewCaseModal
        isOpen={showNewCase}
        onClose={() => setShowNewCase(false)}
        onSubmit={handleNewCase}
      />
      <AssignClinicianModal
        isOpen={!!assignCaseId}
        caseId={assignCaseId}
        clinicians={CLINICIANS}
        onClose={() => setAssignCaseId(null)}
        onAssign={handleAssignClinician}
      />
      <EscalateModal
        isOpen={!!escalateCaseId}
        caseId={escalateCaseId}
        caseName={escalateCaseName}
        onClose={() => setEscalateCaseId(null)}
        onConfirm={handleEscalateConfirm}
      />

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </PageShell>
  )
}
