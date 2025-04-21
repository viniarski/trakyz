// app/admin/components/stat-card.tsx
interface StatCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    subtext?: string
  }
  
  export default function StatCard({ title, value, icon, subtext }: StatCardProps) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-secondary)] text-sm">{title}</p>
            <p className="text-[var(--text-primary)] text-2xl font-semibold mt-1">{value}</p>
            {subtext && <p className="text-[var(--text-secondary)] text-xs mt-1">{subtext}</p>}
          </div>
          <div className="bg-[var(--bg-hover)] p-3 rounded-lg">{icon}</div>
        </div>
      </div>
    )
  }