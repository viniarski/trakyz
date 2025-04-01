// app/(pages)/help/components/help-header.tsx

'use client'

export default function HelpHeader() {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Help Center</h1>
      <p className="text-lg text-[var(--text-secondary)]">
        Find answers, resources, and support for using Trakyz effectively.
      </p>
    </div>
  )
}