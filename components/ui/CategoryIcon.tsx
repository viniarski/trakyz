// app/components/ui/CategoryIcon.tsx

import { 
    Bitcoin, 
    DollarSign, 
    PiggyBank, 
    TrendingUp, 
    Home, 
    CreditCard, 
    Coins,
    BarChart4 
  } from 'lucide-react'
  import { AssetCategory } from '@/types'
  
  interface CategoryIconProps {
    type: AssetCategory
    size?: number
    className?: string
    useTextColor?: boolean  // New prop to use text color instead of category colors
  }
  
  export function CategoryIcon({ type, size = 16, className = '', useTextColor = false }: CategoryIconProps) {
    // Create proper Tailwind classes based on size
    const sizeClass = size === 5 ? 'h-5 w-5' : 
                      size === 4 ? 'h-4 w-4' : 
                      size === 3.5 ? 'h-3.5 w-3.5' :
                      size === 3 ? 'h-3 w-3' : 
                      `h-${size} w-${size}`;
    const baseClass = `${sizeClass} ${className}`
  
    switch (type) {
      case 'Crypto':
        return <Bitcoin className={`${baseClass} ${useTextColor ? 'text-current' : 'text-blue-500'}`} />
      case 'Precious Metals':
        return <Coins className={`${baseClass} ${useTextColor ? 'text-current' : 'text-yellow-500'}`} />
      case 'Stocks & Indexes':
        return <TrendingUp className={`${baseClass} ${useTextColor ? 'text-current' : 'text-green-500'}`} />
      case 'REIT':
        return <Home className={`${baseClass} ${useTextColor ? 'text-current' : 'text-indigo-500'}`} />
      case 'Bonds':
        return <CreditCard className={`${baseClass} ${useTextColor ? 'text-current' : 'text-purple-500'}`} />
      case 'Cash':
        return <DollarSign className={`${baseClass} ${useTextColor ? 'text-current' : 'text-emerald-500'}`} />
      case 'Commodities':
        return <BarChart4 className={`${baseClass} ${useTextColor ? 'text-current' : 'text-amber-500'}`} />
      case 'Real Estate':
        return <Home className={`${baseClass} ${useTextColor ? 'text-current' : 'text-red-500'}`} />
      default:
        return <PiggyBank className={`${baseClass} ${useTextColor ? 'text-current' : 'text-gray-500'}`} />
    }
  }