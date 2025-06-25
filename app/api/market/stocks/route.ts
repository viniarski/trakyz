// app/api/market/stocks/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const STOCK_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: 'NOBL', name: 'ProShares Dividend Aristocrats' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity' },
  { symbol: 'VOO', name: 'Vanguard S&P 500' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'JPM', name: 'JPMorgan Chase' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'WMT', name: 'Walmart' },
  { symbol: 'PG', name: 'Procter & Gamble' },
  { symbol: 'KO', name: 'Coca-Cola' },
  { symbol: 'DIS', name: 'Disney' }
];

export async function GET() {
  try {
    const now = new Date();
    const nowISOString = now.toISOString();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const errors: string[] = []; // Moved to top level of try block

    // Check the latest entry in the DB
    const { data: latestData, error: fetchError } = await supabaseAdmin
      .from('stocks')
      .select('date')
      .eq('date_day', today)
      .order('date', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching latest stocks data:', fetchError);
      throw fetchError;
    }

    // If data exists, check its age
    let shouldFetch = true;
    if (latestData && latestData.length > 0) {
      const latestTimestamp = new Date(latestData[0].date);
      const timeDiff = (now.getTime() - latestTimestamp.getTime()) / 1000; // Difference in seconds
      shouldFetch = timeDiff >= 3600; // 3600 seconds = 1 hour
    }

    let finalData;
    if (shouldFetch) {
      console.log('Fetching new stock prices for timestamp:', nowISOString);

      const symbolNameMap = new Map(
        STOCK_SYMBOLS.map(stock => [
          stock.symbol.replace('^', ''),
          stock.name
        ])
      );

      const stockData = [];

      for (const stock of STOCK_SYMBOLS) {
        const symbolWithoutPrefix = stock.symbol.replace('^', '');
        try {
          console.log(`Fetching data for ${stock.symbol}...`);
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=1d`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const quote = data.chart.result[0].meta;
          const price = quote.regularMarketPrice;
          const volume = data.chart.result[0].indicators.quote[0].volume?.[0] || 0;

          if (!price) {
            throw new Error('No price data available');
          }

          const name = symbolNameMap.get(symbolWithoutPrefix) || stock.name;
          stockData.push({
            symbol: symbolWithoutPrefix,
            name,
            date: nowISOString,
            price,
            volume,
            date_day: today
          });

          console.log(`Successfully processed ${stock.symbol}: $${price} (${name})`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`Error fetching ${stock.symbol}:`, errorMessage);
          errors.push(`${stock.symbol}: ${errorMessage}`);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Delete existing entries for today
      const { error: deleteError } = await supabaseAdmin
        .from('stocks')
        .delete()
        .eq('date_day', today);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Insert new data
      const { error: insertError } = await supabaseAdmin
        .from('stocks')
        .insert(stockData);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Fetch the newly inserted data
      const { data: newData, error: fetchNewError } = await supabaseAdmin
        .from('stocks')
        .select('*')
        .eq('date_day', today)
        .order('symbol', { ascending: true });

      if (fetchNewError) {
        console.error('Error fetching new stocks data:', fetchNewError);
        throw fetchNewError;
      }

      finalData = newData;
    } else {
      console.log('Using existing stocks data from DB');
      // Fetch the latest data without updating
      const { data: existingData, error: fetchExistingError } = await supabaseAdmin
        .from('stocks')
        .select('*')
        .eq('date_day', today)
        .order('symbol', { ascending: true });

      if (fetchExistingError) {
        console.error('Error fetching existing stocks data:', fetchExistingError);
        throw fetchExistingError;
      }

      finalData = existingData;
    }

    return NextResponse.json({
      success: true,
      data: finalData,
      errors: shouldFetch && errors.length > 0 ? errors : undefined // Only include errors if a fetch occurred
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Fatal error in stock price update:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock data', details: errorMessage },
      { status: 500 }
    );
  }
}