// app/(legal)/layout.tsx

import { ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <main className="max-w-6xl mx-auto px-4 py-12">{children}</main>
    </div>
  )
}