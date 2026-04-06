'use client'

import { useState } from 'react'
import PageShell from '@/components/layout/PageShell'
import { UserPlus, Mail, Shield, User, Loader2, Check, X } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  addedAt: string
}

const MOCK_TEAM: StaffMember[] = [
  { id: '1', name: 'Tommy (You)', email: 'tommy@clinic.com.au', role: 'Admin', addedAt: 'Owner' },
]

const ROLES = ['Receptionist', 'Vet', 'Nurse', 'Admin']

export default function UsersClient() {
  const [team, setTeam] = useState<StaffMember[]>(MOCK_TEAM)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Receptionist')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const res = await fetch('/api/users/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Failed to create account')
      setLoading(false)
      return
    }

    setTeam(prev => [...prev, {
      id: data.userId,
      name,
      email,
      role,
      addedAt: new Date().toLocaleDateString('en-AU'),
    }])

    if (data.emailSent === false) {
      setSuccess(`Account created for ${name} but the welcome email could not be sent. Share the login URL with them manually: ${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/login`)
    } else {
      setSuccess(`Account created and welcome email sent to ${email}. They'll receive a link to set their password.`)
    }
    setName(''); setEmail(''); setRole('Receptionist')
    setShowForm(false)
    setLoading(false)
  }

  const roleIcon = (r: string) => r === 'Admin' ? Shield : User

  return (
    <PageShell title="Team & Users">
      <div className="max-w-2xl space-y-6">

        {/* Header card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">{team.length} account{team.length !== 1 ? 's' : ''} on this clinic</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setSuccess(null); setError(null) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-xs font-bold rounded-xl transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Team Member
            </button>
          </div>

          {/* Team list */}
          <div className="space-y-2">
            {team.map(member => {
              const Icon = roleIcon(member.role)
              return (
                <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="w-9 h-9 rounded-full bg-[#0f5b8a] flex items-center justify-center shrink-0 text-white text-xs font-bold">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    <Icon className="w-3 h-3" />
                    {member.role}
                  </div>
                  <p className="text-[10px] text-slate-400 shrink-0">{member.addedAt}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add user form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">New Team Member</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Role *</label>
                  <select value={role} onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="jane@clinic.com.au"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-transparent transition-all" />
              </div>
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3">
                <p className="text-[11px] text-emerald-700 font-medium">
                  A welcome email will be sent automatically with a secure link for them to set their own password.
                </p>
              </div>

              {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0f5b8a] hover:bg-[#0e4f79] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        )}

        {/* Success toast */}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <Check className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">{success}</p>
              <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email them their login details manually.
              </p>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="bg-[#f0f6ff] border border-[#c8e0f4] rounded-2xl p-5">
          <p className="text-xs font-bold text-[#0f5b8a] uppercase tracking-wide mb-2">How staff accounts work</p>
          <ul className="space-y-1.5 text-xs text-slate-600">
            <li>1. Enter their name, email and role</li>
            <li>2. A welcome email is sent automatically with a secure sign-in link</li>
            <li>3. They click the link, set their password, and access the dashboard</li>
          </ul>
        </div>

      </div>
    </PageShell>
  )
}
