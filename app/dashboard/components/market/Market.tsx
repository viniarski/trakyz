// app/dashboard/components/market/Market.tsx

'use client'

import { useState, useEffect } from 'react'
import { MarketData } from '@/types'
import { MarketRates } from '@/components/Markets/MarketRates'
import { useUserSettings } from '@/hooks/use-user-settings'

interface MarketProps {
  marketData: MarketData
  userId: string
}

export default function Market({ marketData, userId }: MarketProps) {
  const [loading, setLoading] = useState(false)
  const { settings, initializeFromDatabase } = useUserSettings()
  const [currencyRates, setCurrencyRates] = useState({
    currencies: marketData.currencies,
    crypto: marketData.crypto
  })

  // Initialize settings from database on first load
  useEffect(() => {
    initializeFromDatabase();
  }, [initializeFromDatabase]);

  // Initialize currency rates from market data
  useEffect(() => {
    setCurrencyRates({
      currencies: marketData.currencies,
      crypto: marketData.crypto
    })
  }, [marketData.currencies, marketData.crypto])

  return (
    <div className="space-y-6">      
      <MarketRates
        metals={marketData.metals}
        crypto={marketData.crypto}
        stocks={marketData.stocks}
        currencies={marketData.currencies}
        loading={loading}
        currencyRates={currencyRates}
        selectedCurrency={settings.selectedCurrency}
      />
    </div>
  )
}