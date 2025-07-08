// app/admin/components/market-status-section.tsx

import MarketStatus from './market-status'

interface MarketStatusSectionProps {
  cryptoLastUpdate: Date | null
  metalsLastUpdate: Date | null
  stocksLastUpdate: Date | null
  currenciesLastUpdate: Date | null
  onUpdate: () => void
  isUpdating: boolean
}

export default function MarketStatusSection({
  cryptoLastUpdate,
  metalsLastUpdate,
  stocksLastUpdate,
  currenciesLastUpdate,
  onUpdate,
  isUpdating
}: MarketStatusSectionProps) {
  return (
    <div className="mb-8">
      <MarketStatus
        cryptoLastUpdate={cryptoLastUpdate}
        metalsLastUpdate={metalsLastUpdate}
        stocksLastUpdate={stocksLastUpdate}
        currenciesLastUpdate={currenciesLastUpdate}
        onUpdate={onUpdate}
        isUpdating={isUpdating}
      />
    </div>
  )
}