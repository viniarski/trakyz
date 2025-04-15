// app/components/ui/category-icon.tsx

import { 
    Bitcoin, 
    DollarSign, 
    PiggyBank, 
    TrendingUp, 
    Home, 
    CreditCard, 
    ShoppingBag,
    BarChart4 
  } from 'lucide-react'
  import { AssetCategory } from '@/types'
  
  interface CategoryIconProps {
    type: AssetCategory
    size?: number
    className?: string
  }
  
  export function CategoryIcon({ type, size = 16, className = '' }: CategoryIconProps) {
    const baseClass = `h-${size} w-${size} ${className}`
  
    switch (type) {
      case 'Crypto':
        return <Bitcoin className={`${baseClass} text-blue-500`} />
      case 'Precious Metals':
        return <ShoppingBag className={`${baseClass} text-yellow-500`} />
      case 'Stocks & Indexes':
        return <TrendingUp className={`${baseClass} text-green-500`} />
      case 'REIT':
        return <Home className={`${baseClass} text-indigo-500`} />
      case 'Bonds':
        return <CreditCard className={`${baseClass} text-purple-500`} />
      case 'Cash':
        return <DollarSign className={`${baseClass} text-emerald-500`} />
      case 'Commodities':
        return <BarChart4 className={`${baseClass} text-amber-500`} />
      case 'Real Estate':
        return <Home className={`${baseClass} text-red-500`} />
      default:
        return <PiggyBank className={`${baseClass} text-gray-500`} />
    }
  }