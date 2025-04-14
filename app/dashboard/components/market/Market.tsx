// app/dashboard/components/market/Market.tsx

"use client";

import { MarketData } from "@/lib/types/marketTypes";

// This is an example usage of marketdata
// Replace with real mapping later

export default function Markets({
  marketData,
  userId,
}: {
  marketData: MarketData;
  userId: string;
}) {
  // Logging market data for easier mapping later
  console.log(marketData);

  // Logging user to ensure its avaliable to the component
  console.log(userId);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Markets</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {marketData.metals.map((metal) => (
          <div key={metal.id} className="border p-2 rounded">
            <strong>{metal.metal}</strong>: ${metal.price}
          </div>
        ))}
        {marketData.crypto.map((crypto) => (
          <div key={crypto.id} className="border p-2 rounded">
            <strong>{crypto.name}</strong>: ${crypto.price}
          </div>
        ))}
        {marketData.currencies.map((currency) => (
          <div key={currency.id} className="border p-2 rounded">
            <strong>{currency.name}</strong>: ${currency.price}
          </div>
        ))}
        {marketData.stocks.map((stock) => (
          <div key={stock.id} className="border p-2 rounded">
            <strong>{stock.name}</strong>: ${stock.price}
          </div>
        ))}
      </div>
    </div>
  );
}
