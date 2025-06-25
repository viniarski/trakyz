// app/admin/components/admin-header.tsx
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AdminHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Dashboard</span>
      </Link>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
    </div>
  )
}