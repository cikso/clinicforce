'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import KpiCard from '../overview/components/KpiCard'

/* ─── Types ─── */

interface SurveyConfig {
  id: string
  clinic_id: string
  enabled: boolean
  delay_minutes: number
  sms_template: string
}

interface SurveyResponse {
  id: string
  clinic_id: string
  patient_name: string | null
  patient_phone: string
  visit_date: string | null
  provider_name: string | null
  nps_score: number | null
  follow_up_text: string | null
  theme: string | null
  sent_at: string | null
  responded_at: string | null
  source: string
}

// Keep in sync with SURVEY_THEMES in src/trigger/survey.ts
const THEME_LABELS: Record<string, string> = {
  wait_time: 'Wait time',
  pricing: 'Pricing',
  staff_friendliness: 'Staff friendliness',
  clinical_quality: 'Clinical quality',
  communication: 'Communication',
  facility_cleanliness: 'Cleanliness',
  appointment_availability: 'Appointment availability',
  billing: 'Billing',
  follow_up_care: 'Follow-up care',
  parking: 'Parking',
  other: 'Other',
}

function themeBadge(theme: string | null) {
  if (!theme) return null
  const label = THEME_LABELS[theme] ?? theme
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 mr-1.5 rounded text-[10px] font-medium bg-[#EEF0F4] text-[#6B7B8F]">
      {label}
    </span>
  )
}

interface SurveyAction {
  id: string
  clinic_id: string
  survey_response_id: string
  patient_name: string | null
  patient_phone: string | null
  visit_date: string | null
  nps_score: number | null
  comment: string | null
  status: 'open' | 'contacted' | 'resolved'
  staff_notes: string | null
  created_at: string
  updated_at: string
}

interface NpsDataPoint {
  nps_score: number
  responded_at: string
}

interface Props {
  clinicId: string
  surveyConfig: SurveyConfig | null
  responses: SurveyResponse[]
  actions: SurveyAction[]
  npsData: NpsDataPoint[]
}

/* ─── Helpers ─── */

function maskPhone(phone: string): string {
  if (phone.length < 8) return phone
  return phone.slice(0, 4) + '****' + phone.slice(-4)
}

function scorePill(score: number | null) {
  if (score === null) return null
  let cls = 'bg-green-100 text-green-700'
  if (score <= 6) cls = 'bg-red-100 text-red-700'
  else if (score <= 8) cls = 'bg-yellow-100 text-yellow-700'
  return (
    <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-[11px] font-bold ${cls}`}>
      {score}
    </span>
  )
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    open: 'bg-red-100 text-red-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function formatDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

/* ─── KPI Icons ─── */

const icons = {
  gauge: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12z" />
      <path d="M8 5v3l2 1" />
    </svg>
  ),
  percent: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="11" cy="11" r="1.5" />
      <path d="M13 3L3 13" />
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L7 9M14 2l-4 12-3-5-5-3z" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3M8 10.5v.5" />
    </svg>
  ),
}

/* ─── Component ─── */

export default function SurveysClient({
  clinicId,
  surveyConfig,
  responses,
  actions: initialActions,
  npsData,
}: Props) {
  const [activeTab, setActiveTab] = useState<'responses' | 'actions'>('responses')
  const [actions, setActions] = useState(initialActions)
  const [slideOver, setSlideOver] = useState<SurveyAction | null>(null)
  const [slideNotes, setSlideNotes] = useState('')
  const [slideStatus, setSlideStatus] = useState<string>('open')
  const [saving, setSaving] = useState(false)

  // Settings state
  const [enabled, setEnabled] = useState(surveyConfig?.enabled ?? false)
  const [delayMinutes, setDelayMinutes] = useState(surveyConfig?.delay_minutes ?? 120)
  const [smsTemplate, setSmsTemplate] = useState(surveyConfig?.sms_template ?? '')
  const [settingsSaving, setSettingsSaving] = useState(false)

  // Manual trigger modal
  const [showManual, setShowManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualDate, setManualDate] = useState('')
  const [manualProvider, setManualProvider] = useState('')
  const [manualSending, setManualSending] = useState(false)

  /* ─── KPI calculations ─── */

  const sent = responses.filter(r => r.sent_at).length
  const responded = responses.filter(r => r.nps_score !== null).length
  const promoters = responses.filter(r => r.nps_score !== null && r.nps_score >= 9).length
  const detractors = responses.filter(r => r.nps_score !== null && r.nps_score <= 6).length
  const npsScore = responded > 0
    ? Math.round(((promoters - detractors) / responded) * 100)
    : 0
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0
  const openActions = actions.filter(a => a.status === 'open').length

  /* ─── NPS trend chart data ─── */

  const chartData = useMemo(() => {
    if (npsData.length === 0) return []

    // Group by day, calculate rolling NPS
    const byDay: Record<string, { promoters: number; detractors: number; total: number }> = {}
    for (const d of npsData) {
      const day = new Date(d.responded_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
      if (!byDay[day]) byDay[day] = { promoters: 0, detractors: 0, total: 0 }
      byDay[day].total++
      if (d.nps_score >= 9) byDay[day].promoters++
      if (d.nps_score <= 6) byDay[day].detractors++
    }

    return Object.entries(byDay).map(([day, v]) => ({
      day,
      nps: v.total > 0 ? Math.round(((v.promoters - v.detractors) / v.total) * 100) : 0,
    }))
  }, [npsData])

  /* ─── Top themes (30 days) ─── */

  const themeStats = useMemo(() => {
    const counts: Record<string, { total: number; detractors: number }> = {}
    for (const r of responses) {
      if (!r.theme) continue
      if (!counts[r.theme]) counts[r.theme] = { total: 0, detractors: 0 }
      counts[r.theme].total++
      if (r.nps_score !== null && r.nps_score <= 6) counts[r.theme].detractors++
    }
    const total = Object.values(counts).reduce((acc, v) => acc + v.total, 0)
    return Object.entries(counts)
      .map(([theme, v]) => ({
        theme,
        label: THEME_LABELS[theme] ?? theme,
        count: v.total,
        detractors: v.detractors,
        pct: total > 0 ? Math.round((v.total / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [responses])

  /* ─── Action slide-over ─── */

  const openSlideOver = useCallback((action: SurveyAction) => {
    setSlideOver(action)
    setSlideNotes(action.staff_notes ?? '')
    setSlideStatus(action.status)
  }, [])

  const saveAction = useCallback(async () => {
    if (!slideOver) return
    setSaving(true)
    try {
      const res = await fetch(`/api/survey/actions/${slideOver.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: slideStatus, staff_notes: slideNotes }),
      })
      if (res.ok) {
        const updated = await res.json()
        setActions(prev => prev.map(a => a.id === updated.id ? updated : a))
        setSlideOver(null)
      }
    } finally {
      setSaving(false)
    }
  }, [slideOver, slideStatus, slideNotes])

  /* ─── Settings save ─── */

  const saveSettings = useCallback(async () => {
    setSettingsSaving(true)
    try {
      await fetch('/api/survey/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, delay_minutes: delayMinutes, sms_template: smsTemplate }),
      })
    } finally {
      setSettingsSaving(false)
    }
  }, [enabled, delayMinutes, smsTemplate])

  /* ─── Manual trigger ─── */

  const sendManual = useCallback(async () => {
    setManualSending(true)
    try {
      await fetch('/api/survey/send-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: manualName,
          patient_phone: manualPhone,
          visit_date: manualDate || undefined,
          provider_name: manualProvider || undefined,
        }),
      })
      setShowManual(false)
      setManualName('')
      setManualPhone('')
      setManualDate('')
      setManualProvider('')
    } finally {
      setManualSending(false)
    }
  }, [manualName, manualPhone, manualDate, manualProvider])

  /* ─── Delay options ─── */

  const delayOptions = [
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '4 hours', value: 240 },
    { label: 'Next day', value: 1440 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#0A2540]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Post-Visit Surveys
          </h1>
          <p className="text-[13px] text-[#8A94A6] mt-0.5">NPS tracking and patient feedback</p>
        </div>
        <button
          onClick={() => setShowManual(true)}
          className="px-4 py-2 text-[13px] font-medium rounded-lg border border-[#DDE1E7] text-[#0A2540] hover:bg-[#F4F6F9] transition-colors"
        >
          Send Survey Manually
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="NPS Score"
          value={`${npsScore >= 0 ? '+' : ''}${npsScore}`}
          compareStat={`${responded} responses`}
          delta={`${promoters}P / ${detractors}D`}
          deltaType={npsScore >= 50 ? 'up' : npsScore >= 0 ? 'neutral' : 'down'}
          iconBg="#E6F0FB"
          iconColor="#1A5FA8"
          icon={icons.gauge}
        />
        <KpiCard
          label="Response Rate"
          value={`${responseRate}%`}
          compareStat={`${responded} of ${sent} replied`}
          delta={sent > 0 ? `${sent} sent` : 'No data'}
          deltaType={responseRate >= 40 ? 'up' : responseRate >= 20 ? 'neutral' : 'down'}
          iconBg="#E9F6EC"
          iconColor="#1A7A3A"
          icon={icons.percent}
        />
        <KpiCard
          label="Total Sent"
          value={String(sent)}
          compareStat="Last 30 days"
          delta={sent > 0 ? 'Active' : 'None'}
          deltaType={sent > 0 ? 'up' : 'neutral'}
          iconBg="#F2EEFB"
          iconColor="#6B3FA0"
          icon={icons.send}
        />
        <KpiCard
          label="Open Actions"
          value={String(openActions)}
          compareStat="Detractor follow-ups"
          delta={openActions > 0 ? 'Needs attention' : 'All clear'}
          deltaType={openActions > 0 ? 'down' : 'up'}
          iconBg="#FEF0F5"
          iconColor="#A0305A"
          icon={icons.alert}
        />
      </div>

      {/* Two-column: Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Trend Chart */}
        <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
          <h2 className="text-[14px] font-semibold text-[#0A2540] mb-4">NPS Trend (30 days)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF0F4" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#B0BAC9' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#B0BAC9' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[-100, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #DDE1E7',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="nps"
                  stroke="#1A5FA8"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#1A5FA8' }}
                  name="NPS"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[13px] text-[#B0BAC9]">
              No response data yet
            </div>
          )}
        </div>

        {/* Recent Responses / Actions tabs */}
        <div className="bg-white rounded-lg" style={{ border: '1.5px solid #DDE1E7' }}>
          <div className="flex border-b border-[#EEF0F4]">
            <button
              onClick={() => setActiveTab('responses')}
              className={`flex-1 px-4 py-3 text-[13px] font-semibold transition-colors ${
                activeTab === 'responses'
                  ? 'text-[#1A5FA8] border-b-2 border-[#1A5FA8]'
                  : 'text-[#8A94A6] hover:text-[#0A2540]'
              }`}
            >
              Recent Responses
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 px-4 py-3 text-[13px] font-semibold transition-colors relative ${
                activeTab === 'actions'
                  ? 'text-[#1A5FA8] border-b-2 border-[#1A5FA8]'
                  : 'text-[#8A94A6] hover:text-[#0A2540]'
              }`}
            >
              Actions
              {openActions > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {openActions}
                </span>
              )}
            </button>
          </div>

          <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
            {activeTab === 'responses' ? (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#F8F9FB]">
                  <tr>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Date</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Patient</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Score</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-[13px] text-[#B0BAC9]">
                        No surveys sent yet
                      </td>
                    </tr>
                  ) : (
                    responses.map(r => (
                      <tr key={r.id} className="border-t border-[#EEF0F4] hover:bg-[#FAFBFC]">
                        <td className="px-4 py-2.5 text-[12px] text-[#6B7B8F] whitespace-nowrap">
                          {formatDate(r.sent_at)}
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-[12px] font-medium text-[#0A2540]">{r.patient_name ?? '—'}</p>
                          <p className="text-[10px] text-[#B0BAC9]">{maskPhone(r.patient_phone)}</p>
                        </td>
                        <td className="px-4 py-2.5">{scorePill(r.nps_score)}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#6B7B8F] max-w-[180px] truncate">
                          {themeBadge(r.theme)}
                          {r.follow_up_text ?? '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#F8F9FB]">
                  <tr>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Date</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Patient</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Score</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Comment</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Status</th>
                    <th className="px-4 py-2.5 text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]"></th>
                  </tr>
                </thead>
                <tbody>
                  {actions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#B0BAC9]">
                        No actions yet
                      </td>
                    </tr>
                  ) : (
                    actions.map(a => (
                      <tr key={a.id} className="border-t border-[#EEF0F4] hover:bg-[#FAFBFC]">
                        <td className="px-4 py-2.5 text-[12px] text-[#6B7B8F] whitespace-nowrap">
                          {formatDate(a.created_at)}
                        </td>
                        <td className="px-4 py-2.5 text-[12px] font-medium text-[#0A2540]">
                          {a.patient_name ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">{scorePill(a.nps_score)}</td>
                        <td className="px-4 py-2.5 text-[12px] text-[#6B7B8F] max-w-[160px] truncate">
                          {a.comment ?? '—'}
                        </td>
                        <td className="px-4 py-2.5">{statusBadge(a.status)}</td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => openSlideOver(a)}
                            className="text-[11px] font-medium text-[#1A5FA8] hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Top Themes Card */}
      <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-[#0A2540]">Top Themes (30 days)</h2>
          <p className="text-[11px] text-[#B0BAC9]">AI-clustered from free-text replies</p>
        </div>
        {themeStats.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-[#B0BAC9]">
            No themed feedback yet — themes appear once respondents send a free-text reply.
          </div>
        ) : (
          <div className="space-y-2.5">
            {themeStats.map(t => (
              <div key={t.theme} className="flex items-center gap-3">
                <div className="w-[160px] text-[12px] font-medium text-[#0A2540] truncate">
                  {t.label}
                </div>
                <div className="flex-1 h-[8px] bg-[#F4F6F9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1A5FA8]"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <div className="w-[80px] text-right text-[11px] text-[#6B7B8F] tabular-nums">
                  {t.count} · {t.pct}%
                </div>
                <div className="w-[80px] text-right text-[11px] tabular-nums">
                  {t.detractors > 0 ? (
                    <span className="text-red-600 font-medium">{t.detractors} detractor{t.detractors === 1 ? '' : 's'}</span>
                  ) : (
                    <span className="text-[#B0BAC9]">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-lg p-5" style={{ border: '1.5px solid #DDE1E7' }}>
        <h2 className="text-[14px] font-semibold text-[#0A2540] mb-4">Survey Settings</h2>
        <div className="space-y-5">
          {/* Enable toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative w-10 h-[22px] rounded-full transition-colors ${enabled ? 'bg-[#1A5FA8]' : 'bg-[#DDE1E7]'}`}
            >
              <span
                className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${enabled ? 'left-[20px]' : 'left-[2px]'}`}
              />
            </button>
            <span className="text-[13px] font-medium text-[#0A2540]">
              Enable post-visit surveys
            </span>
          </div>

          {/* Delay */}
          <div>
            <p className="text-[12px] font-semibold text-[#8A94A6] uppercase tracking-[1px] mb-2">Send Delay</p>
            <div className="flex gap-2">
              {delayOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDelayMinutes(opt.value)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors ${
                    delayMinutes === opt.value
                      ? 'bg-[#E6F0FB] text-[#1A5FA8] border-[#1A5FA8]'
                      : 'bg-white text-[#6B7B8F] border-[#DDE1E7] hover:bg-[#F4F6F9]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SMS Template */}
          <div>
            <p className="text-[12px] font-semibold text-[#8A94A6] uppercase tracking-[1px] mb-2">SMS Template</p>
            <textarea
              value={smsTemplate}
              onChange={e => setSmsTemplate(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] text-[#0A2540] focus:outline-none focus:border-[#1A5FA8] resize-none"
              placeholder="Hi {{patient_name}}, thanks for visiting {{clinic_name}}..."
            />
            <p className="text-[10px] text-[#B0BAC9] mt-1">
              Available variables: {'{{patient_name}}'} {'{{clinic_name}}'}
            </p>
          </div>

          <button
            onClick={saveSettings}
            disabled={settingsSaving}
            className="px-4 py-2 text-[13px] font-medium rounded-lg bg-[#1A5FA8] text-white hover:bg-[#15508E] transition-colors disabled:opacity-50"
          >
            {settingsSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* ─── Slide-over panel ─── */}
      {slideOver && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setSlideOver(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl border-l border-[#DDE1E7] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF0F4]">
              <h3 className="text-[15px] font-bold text-[#0A2540]">Action Detail</h3>
              <button
                onClick={() => setSlideOver(null)}
                className="p-1 rounded-md text-[#8A94A6] hover:text-[#0A2540]"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 5l8 8M13 5L5 13" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Patient</p>
                <p className="text-[14px] font-medium text-[#0A2540]">{slideOver.patient_name ?? '—'}</p>
                <p className="text-[12px] text-[#6B7B8F]">{slideOver.patient_phone ? maskPhone(slideOver.patient_phone) : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Visit Date</p>
                <p className="text-[13px] text-[#0A2540]">{formatDate(slideOver.visit_date)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Score</p>
                <div className="mt-1">{scorePill(slideOver.nps_score)}</div>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6]">Comment</p>
                <p className="text-[13px] text-[#0A2540]">{slideOver.comment ?? 'No comment yet'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-1">Status</p>
                <select
                  value={slideStatus}
                  onChange={e => setSlideStatus(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] text-[#0A2540] focus:outline-none focus:border-[#1A5FA8]"
                >
                  <option value="open">Open</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[1px] font-semibold text-[#8A94A6] mb-1">Staff Notes</p>
                <textarea
                  value={slideNotes}
                  onChange={e => setSlideNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] text-[#0A2540] focus:outline-none focus:border-[#1A5FA8] resize-none"
                  placeholder="Add notes about follow-up..."
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#EEF0F4]">
              <button
                onClick={saveAction}
                disabled={saving}
                className="w-full py-2.5 text-[13px] font-medium rounded-lg bg-[#1A5FA8] text-white hover:bg-[#15508E] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ─── Manual trigger modal ─── */}
      {showManual && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowManual(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" style={{ border: '1.5px solid #DDE1E7' }}>
              <h3 className="text-[15px] font-bold text-[#0A2540] mb-4">Send Survey Manually</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-[0.5px]">Patient Name *</label>
                  <input
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] focus:outline-none focus:border-[#1A5FA8]"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-[0.5px]">Phone (E.164) *</label>
                  <input
                    value={manualPhone}
                    onChange={e => setManualPhone(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] focus:outline-none focus:border-[#1A5FA8]"
                    placeholder="+61412345678"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-[0.5px]">Visit Date</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] focus:outline-none focus:border-[#1A5FA8]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#8A94A6] uppercase tracking-[0.5px]">Provider</label>
                  <input
                    value={manualProvider}
                    onChange={e => setManualProvider(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-[13px] rounded-lg border border-[#DDE1E7] focus:outline-none focus:border-[#1A5FA8]"
                    placeholder="Dr. Johnson"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowManual(false)}
                  className="flex-1 py-2 text-[13px] font-medium rounded-lg border border-[#DDE1E7] text-[#6B7B8F] hover:bg-[#F4F6F9] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={sendManual}
                  disabled={manualSending || !manualName || !manualPhone}
                  className="flex-1 py-2 text-[13px] font-medium rounded-lg bg-[#1A5FA8] text-white hover:bg-[#15508E] transition-colors disabled:opacity-50"
                >
                  {manualSending ? 'Sending...' : 'Send Survey'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
