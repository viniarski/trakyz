// app/(legal)/terms/components/terms-header.tsx

'use client'

export default function TermsHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-[var(--text-primary)]">Terms of Service</h1>
      <p className="text-sm text-[var(--text-secondary)] mt-2">
        Effective Date: February 23, 2025 | Last Updated: February 23, 2025
      </p>
    </div>
  )
}