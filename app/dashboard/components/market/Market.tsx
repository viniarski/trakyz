// app/dashboard/components/market/Market.tsx

'use client'

import { useState, useEffect } from 'react'
import { MarketData, CurrencyCode } from '@/types'
import { MarketRates } from '@/components/Markets/MarketRates'
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore'
import { useMarketSettingsStore } from '@/lib/stores/useMarketSettingsStore'
import { useWatchlistStore } from '@/lib/stores/useWatchlistStore'

interface MarketProps {
  marketData: MarketData
  userId: string
}

export default function Market({ marketData, userId }: MarketProps) {
  const [loading, setLoading] = useState(false)
  const { currency } = useCurrencyStore()
  const { initializeFromDatabase: initializeMarketSettings } = useMarketSettingsStore()
  const { initializeFromDatabase: initializeWatchlist } = useWatchlistStore()
  const [currencyRates, setCurrencyRates] = useState({
    currencies: marketData.currencies,
    crypto: marketData.crypto
  })

  // Initialize settings from database on first load
  useEffect(() => {
    initializeMarketSettings();
    initializeWatchlist();
  }, [initializeMarketSettings, initializeWatchlist]);

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
        selectedCurrency={currency as CurrencyCode}
        currencyRates={currencyRates}
      />
    </div>
  )
}