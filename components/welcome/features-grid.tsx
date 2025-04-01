'use client'

import { LineChart, BarChart2, TrendingUp } from 'lucide-react'
import FeatureCard from './feature-card'

export default function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
      <FeatureCard 
        icon={<LineChart />}
        title="Real-Time Tracking"
        description="Monitor your portfolio performance with live market data and interactive charts"
      />
      <FeatureCard 
        icon={<BarChart2 />}
        title="Advanced Analytics"
        description="Gain insights with detailed performance metrics and portfolio analysis"
      />
      <FeatureCard 
        icon={<TrendingUp />}
        title="Multiple Assets"
        description="Track stocks, crypto, precious metals, real estate, and more in one place"
      />
    </div>
  )
}