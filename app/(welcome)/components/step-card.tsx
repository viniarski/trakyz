// components/welcome/step-card.tsx

'use client'

export default function StepCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6">
      <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
        <div className="h-6 w-6 text-blue-500">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}