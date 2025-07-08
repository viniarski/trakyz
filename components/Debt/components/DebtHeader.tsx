// components/Debt/components/DebtHeader.tsx

'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DebtHeaderProps {
  onAddLoan: () => void
  onAddCreditCard: () => void
}

export function DebtHeader({
  onAddLoan,
  onAddCreditCard
}: DebtHeaderProps) {
  return (
    <div>
      {/* Header with buttons - same styling as Markets/Transactions */}
      <div className="p-4 flex justify-between items-center flex-wrap gap-y-2">
        {/* Left side - buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Loan button */}
          <Button
            onClick={onAddLoan}
            variant="subtle"
            size="sm"
            className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Loan</span>
          </Button>
          
          {/* Add Credit Card button */}
          <Button
            onClick={onAddCreditCard}
            variant="subtle"
            size="sm"
            className="flex items-center gap-1.5 bg-[var(--accent-primary-10)] hover:bg-[var(--accent-primary-20)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Add Credit Card</span>
          </Button>
        </div>
        
        {/* Right side - empty for now, could add filters/export later */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Future: filters, export, etc. */}
        </div>
      </div>
      
      {/* Border line - same as Markets/Transactions */}
      <div className="border-t border-gray-800/50"></div>
    </div>
  )
}