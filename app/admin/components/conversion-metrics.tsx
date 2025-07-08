// app/admin/components/conversion-metrics.tsx

import { Percent, UserX } from 'lucide-react'
import StatCard from './stat-card'

interface ConversionMetrics {
  trialConversionRate: number
  churnRate: number
}

export default function ConversionMetrics({ metrics }: { metrics: ConversionMetrics }) {
  return (
    <div className="mb-8">
      <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Conversion Metrics</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Trial Conversion Rate"
            value={`${metrics.trialConversionRate.toFixed(1)}%`}
            icon={<Percent className="h-4 w-4 text-teal-500" />}
            subtext="Free/Trial to Pro"
          />
          <StatCard
            title="Churn Rate (1-3 Mo)"
            value={`${metrics.churnRate.toFixed(1)}%`}
            icon={<UserX className="h-4 w-4 text-red-500" />}
            subtext="Cancellations within 1-3 months"
          />
        </div>
      </div>
    </div>
  )
}