// lib/asset-options.ts

// Crypto assets
export const CRYPTO_ASSETS = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'XRP' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'ATOM', name: 'Cosmos' },
    { symbol: 'ALGO', name: 'Algorand' },
  ] as const;
  
  // Precious metals
  export const PRECIOUS_METALS = [
    { symbol: 'GOLD', name: 'Gold' },
    { symbol: 'SILVER', name: 'Silver' },
    { symbol: 'PLATINUM', name: 'Platinum' },
    { symbol: 'PALLADIUM', name: 'Palladium' },
    { symbol: 'RHODIUM', name: 'Rhodium' },
  ] as const;
  
  // Stocks and indexes
  export const STOCKS_AND_INDEXES = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. Class A' },
    { symbol: 'GOOG', name: 'Alphabet Inc. Class C' },
    { symbol: 'META', name: 'Meta Platforms, Inc.' },
    { symbol: 'TSLA', name: 'Tesla, Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc. Class A' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'UNH', name: 'UnitedHealth Group Incorporated' },
    { symbol: 'HD', name: 'The Home Depot, Inc.' },
    { symbol: 'PG', name: 'The Procter & Gamble Company' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
    { symbol: 'BAC', name: 'Bank of America Corporation' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust Series 1' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  ] as const;
  
  // REITs
  export const REIT_ASSETS = [
    { symbol: 'AMT', name: 'American Tower Corporation' },
    { symbol: 'PLD', name: 'Prologis, Inc.' },
    { symbol: 'CCI', name: 'Crown Castle Inc.' },
    { symbol: 'EQIX', name: 'Equinix, Inc.' },
    { symbol: 'PSA', name: 'Public Storage' },
    { symbol: 'O', name: 'Realty Income Corporation' },
    { symbol: 'WELL', name: 'Welltower Inc.' },
    { symbol: 'SPG', name: 'Simon Property Group, Inc.' },
    { symbol: 'DLR', name: 'Digital Realty Trust, Inc.' },
    { symbol: 'VTR', name: 'Ventas, Inc.' },
  ] as const;
  
  // Bonds
  export const BONDS = [
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF' },
    { symbol: 'BND', name: 'Vanguard Total Bond Market ETF' },
    { symbol: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
    { symbol: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF' },
    { symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF' },
    { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
    { symbol: 'JNK', name: 'SPDR Bloomberg High Yield Bond ETF' },
    { symbol: 'MUB', name: 'iShares National Muni Bond ETF' },
    { symbol: 'VCIT', name: 'Vanguard Intermediate-Term Corporate Bond ETF' },
  ] as const;
  
  // Commodities
  export const COMMODITIES = [
    { symbol: 'OIL', name: 'Crude Oil' },
    { symbol: 'NATGAS', name: 'Natural Gas' },
    { symbol: 'WHEAT', name: 'Wheat' },
    { symbol: 'CORN', name: 'Corn' },
    { symbol: 'SOYBEAN', name: 'Soybean' },
    { symbol: 'COFFEE', name: 'Coffee' },
    { symbol: 'COTTON', name: 'Cotton' },
    { symbol: 'SUGAR', name: 'Sugar' },
    { symbol: 'COPPER', name: 'Copper' },
    { symbol: 'LUMBER', name: 'Lumber' },
  ] as const;
  
  // Currencies
  export const CURRENCIES = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', name: 'Chinese Yuan' },
    { code: 'INR', name: 'Indian Rupee' },
    { code: 'BRL', name: 'Brazilian Real' },
  ] as const;