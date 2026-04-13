'use client'

import React from 'react'

// ── Shared style constants ─────────────────────────────────────────────────

export const stepHeading: React.CSSProperties = {
  fontFamily: "'Instrument Serif', Georgia, serif",
  fontSize: '1.875rem',
  fontWeight: 400,
  color: '#1A1A1A',
  lineHeight: 1.2,
  marginBottom: '0.4rem',
}

export const stepSubheading: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#17C4BE',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '0.5rem',
}

// ── StepCard ──────────────────────────────────────────────────────────────

export function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        backgroundColor: '#ffffff',
        border: '1px solid #E8E4DE',
        borderRadius: 16,
        padding: '2.5rem',
      }}
    >
      {children}
    </div>
  )
}

// ── Field ─────────────────────────────────────────────────────────────────

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1A1A1A',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontFamily: "'DM Sans'", fontSize: '0.78rem', color: '#9B9B9B', marginTop: '0.1rem' }}>
          {hint}
        </p>
      )}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────

export const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  backgroundColor: '#ffffff',
  border: '1px solid #E8E4DE',
  borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.95rem',
  color: '#1A1A1A',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...props.style }}
      onFocus={(e) => { e.target.style.borderColor = '#17C4BE'; props.onFocus?.(e) }}
      onBlur={(e) => { e.target.style.borderColor = '#E8E4DE'; props.onBlur?.(e) }}
    />
  )
}

// ── Select ────────────────────────────────────────────────────────────────

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        ...inputBase,
        cursor: 'pointer',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239B9B9B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        paddingRight: '2.5rem',
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = '#17C4BE'; props.onFocus?.(e) }}
      onBlur={(e) => { e.target.style.borderColor = '#E8E4DE'; props.onBlur?.(e) }}
    />
  )
}

// ── Textarea ──────────────────────────────────────────────────────────────

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...inputBase,
        resize: 'vertical',
        minHeight: 80,
        ...props.style,
      }}
      onFocus={(e) => { e.target.style.borderColor = '#17C4BE'; props.onFocus?.(e) }}
      onBlur={(e) => { e.target.style.borderColor = '#E8E4DE'; props.onBlur?.(e) }}
    />
  )
}

// ── Toggle ────────────────────────────────────────────────────────────────

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
}) {
  return (
    <label
      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 40,
          height: 22,
          borderRadius: 999,
          backgroundColor: checked ? '#17C4BE' : '#E8E4DE',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 0.2s',
          padding: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            transition: 'left 0.2s',
            display: 'block',
          }}
        />
      </button>
      {label && (
        <span style={{ fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#1A1A1A' }}>
          {label}
        </span>
      )}
    </label>
  )
}

// ── SubmitButton ──────────────────────────────────────────────────────────

export function SubmitButton({
  isPending,
  label = 'Save & Continue',
  pendingLabel = 'Saving...',
}: {
  isPending: boolean
  label?: string
  pendingLabel?: string
}) {
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        width: '100%',
        padding: '0.875rem',
        backgroundColor: isPending ? '#45c5bf' : '#17C4BE',
        color: '#ffffff',
        border: 'none',
        borderRadius: 10,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: isPending ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'background-color 0.15s, transform 0.1s',
        marginTop: '0.5rem',
      }}
      onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.98)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {isPending ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'cf-spin 0.8s linear infinite' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </>
      )}
      <style>{`@keyframes cf-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </button>
  )
}

// ── BackButton ────────────────────────────────────────────────────────────

export function BackButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '0.875rem',
        color: '#6B6B6B',
        textDecoration: 'none',
        marginBottom: '1.25rem',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      Back
    </a>
  )
}

// ── ErrorBanner ───────────────────────────────────────────────────────────

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontFamily: "'DM Sans'", fontSize: '0.875rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </div>
  )
}
