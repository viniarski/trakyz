// components/Portfolios/components/CategoryIcon.tsx
'use client'

import { 
  Bitcoin, 
  Gem, 
  TrendingUp, 
  Building, 
  Banknote, 
  DollarSign, 
  Wheat, 
  Home 
} from 'lucide-react'
import { AssetCategory } from '@/types'

interface CategoryIconProps {
  type: AssetCategory
  className?: string
}

export function CategoryIcon({ type, className = "h-4 w-4" }: CategoryIconProps) {
  const iconProps = {
    className: `${className} text-[var(--accent-primary)]`
  }

  switch (type) {
    case 'Crypto':
      return <Bitcoin {...iconProps} />
    case 'Precious Metals':
      return <Gem {...iconProps} />
    case 'Stocks & Indexes':
      return <TrendingUp {...iconProps} />
    case 'REIT':
      return <Building {...iconProps} />
    case 'Bonds':
      return <Banknote {...iconProps} />
    case 'Cash':
      return <DollarSign {...iconProps} />
    case 'Commodities':
      return <Wheat {...iconProps} />
    case 'Real Estate':
      return <Home {...iconProps} />
    default:
      return <DollarSign {...iconProps} />
  }
}