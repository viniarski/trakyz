// app/admin/components/stats-grid.tsx
import { Users, Shield, Activity, Clock, TrendingUp } from 'lucide-react'
import StatCard from './stat-card'

interface Stats {
  totalUsers: number
  proUsers: number
  freeUsers: number
  proPercentage: number
  activeToday: number
  activeLast7Days: number
  lastUpdate: string
}

export default function StatsGrid({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <StatCard title="Total Users" value={stats.totalUsers} icon={<Users className="h-4 w-4 text-blue-500" />} />
      <StatCard title="Pro Users" value={stats.proUsers} icon={<Shield className="h-4 w-4 text-green-500" />} subtext={`${stats.proPercentage.toFixed(1)}% of total`} />
      <StatCard title="Free Users" value={stats.freeUsers} icon={<Shield className="h-4 w-4 text-gray-500" />} subtext={`${(100 - stats.proPercentage).toFixed(1)}% of total`} />
      <StatCard title="Active Today" value={stats.activeToday} icon={<Activity className="h-4 w-4 text-purple-500" />} />
      <StatCard title="Active (7 Days)" value={stats.activeLast7Days} icon={<Clock className="h-4 w-4 text-orange-500" />} />
      <StatCard title="Activity Rate" value={`${((stats.activeLast7Days / stats.totalUsers) * 100).toFixed(1)}%`} icon={<TrendingUp className="h-4 w-4 text-pink-500" />} subtext="7-day active users" />
    </div>
  )
}