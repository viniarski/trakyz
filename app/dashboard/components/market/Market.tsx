'use client'

import { useState, useEffect } from 'react'
import { MarketData, CurrencyCode } from '@/types'
import { MarketRates } from '@/components/market-rates/market-rates'
import { useCurrencyStore } from '@/lib/stores/useCurrencyStore'

interface MarketProps {
  marketData: MarketData
  userId: string
}

export default function Market({ marketData, userId }: MarketProps) {
  const [loading, setLoading] = useState(false)
  const { currency } = useCurrencyStore()
  const [currencyRates, setCurrencyRates] = useState({
    currencies: marketData.currencies,
    crypto: marketData.crypto
  })

  // Initialize currency rates from market data
  useEffect(() => {
    setCurrencyRates({
      currencies: marketData.currencies,
      crypto: marketData.crypto
    })
  }, [marketData.currencies, marketData.crypto])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Markets</h2>
      
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