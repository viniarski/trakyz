// app/welcome/components/asset-classes.tsx

'use client'

export default function AssetClasses() {
  const assets = [
    'Stocks & ETFs',
    'Cryptocurrencies',
    'Precious Metals',
    'Real Estate',
    'Bonds',
    'Commodities',
    'Forex',
    'REITs'
  ]

  return (
    <div className="py-20">
      <h2 className="text-3xl font-bold text-white mb-12 text-center">
        Track Any Asset Class
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div 
            key={asset}
            className="bg-gray-800/50 backdrop-blur rounded-xl p-4 text-center text-gray-300 hover:bg-gray-800 transition-colors"
          >
            {asset}
          </div>
        ))}
      </div>
    </div>
  )
}