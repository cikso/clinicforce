'use client'

import React from 'react'

/**
 * Shared wizard primitives.
 *
 * Aligns with the app's design tokens (brand/border/text vars, Geist +
 * heading fonts) so onboarding matches the dashboard users land on next.
 * The components intentionally stay plain — pages compose them into step
 * layouts without needing wrapper state.
 */

// ── Shared style constants ─────────────────────────────────────────────────

export const stepHeading: React.CSSProperties = {
  fontFamily: 'var(--font-heading), ui-sans-serif, system-ui, sans-serif',
  fontSize: '26px',
  fontWeight: 800,
  color: 'var(--text-primary)',
  lineHeight: 1.15,
  letterSpacing: '-0.02em',
  marginBottom: '6px',
}

export const stepSubheading: React.CSSProperties = {
  fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--brand-dark)',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  marginBottom: '8px',
}

// ── StepDescription ───────────────────────────────────────────────────────
// Shared intro paragraph that sits between the step heading and the form.
// Wizard pages used to inline this 4x with slightly different whitespace —
// centralising keeps them consistent and tokenised.

export function StepDescription({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        lineHeight: 1.55,
        color: 'var(--text-secondary)',
        marginBottom: '28px',
        marginTop: 0,
      }}
    >
      {children}
    </p>
  )
}

// ── StepCard ──────────────────────────────────────────────────────────────

export function StepCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 580,
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '36px',
        boxShadow: 'var(--shadow-card)',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p
          style={{
            fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            marginTop: '2px',
            lineHeight: 1.5,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

// ── Input ─────────────────────────────────────────────────────────────────

export const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'var(--bg-primary)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 140ms ease, box-shadow 140ms ease',
}

function applyFocus(el: HTMLElement) {
  el.style.borderColor = 'var(--brand)'
  el.style.boxShadow = '0 0 0 3px rgba(0, 214, 143, 0.18)'
}
function applyBlur(el: HTMLElement) {
  el.style.borderColor = 'var(--border)'
  el.style.boxShadow = 'none'
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...props.style }}
      onFocus={(e) => { applyFocus(e.target); props.onFocus?.(e) }}
      onBlur={(e) => { applyBlur(e.target); props.onBlur?.(e) }}
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
        // Carets use the text-tertiary token rendered as hex since data URIs can't
        // evaluate CSS vars. Keep in sync if the token changes.
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A96A3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '40px',
        ...props.style,
      }}
      onFocus={(e) => { applyFocus(e.target); props.onFocus?.(e) }}
      onBlur={(e) => { applyBlur(e.target); props.onBlur?.(e) }}
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
        minHeight: 88,
        lineHeight: 1.5,
        ...props.style,
      }}
      onFocus={(e) => { applyFocus(e.target); props.onFocus?.(e) }}
      onBlur={(e) => { applyBlur(e.target); props.onBlur?.(e) }}
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
      style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
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
          backgroundColor: checked ? 'var(--brand)' : 'var(--border)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
          transition: 'background-color 180ms ease',
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
            boxShadow: '0 1px 2px rgba(15,23,42,0.18)',
            transition: 'left 180ms ease',
            display: 'block',
          }}
        />
      </button>
      {label && (
        <span
          style={{
            fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}
        >
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
        padding: '14px',
        backgroundColor: isPending ? 'var(--brand-dark)' : 'var(--brand)',
        color: '#ffffff',
        border: 'none',
        borderRadius: 10,
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        fontSize: '14px',
        fontWeight: 700,
        cursor: isPending ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background-color 140ms ease, transform 90ms ease',
        marginTop: '8px',
        letterSpacing: '0.01em',
      }}
      onMouseDown={(e) => { if (!isPending) e.currentTarget.style.transform = 'scale(0.985)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
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
        gap: '6px',
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        marginBottom: '18px',
        transition: 'color 140ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
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
    <div
      role="alert"
      style={{
        padding: '10px 14px',
        backgroundColor: 'var(--error-light)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: 10,
        fontFamily: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--error)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {children}
    </div>
  )
}
