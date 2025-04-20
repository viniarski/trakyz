// app/api/market/stocks/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Direct Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials:', { 
    hasUrl: !!supabaseUrl, 
    hasServiceKey: !!supabaseServiceKey 
  });
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
    const errors: string[] = []; // Track any errors during fetching
    
    console.log('Stocks API: Starting request', { today });

    // Check if we have today's base (00:00) entry
    let baseTodayData = null;
    let latestTodayData = null;
    
    try {
      const baseResult = await supabaseAdmin
        .from('stocks')
        .select('*')
        .eq('date_day', today)
        .ilike('date', `${today}T00:%`) // Match entries close to midnight
        .order('date', { ascending: false })
        .limit(1);

      if (baseResult.error) {
        console.error('Error fetching base stocks data:', baseResult.error);
      } else {
        baseTodayData = baseResult.data;
        console.log('Stocks API: Base data check complete', { 
          hasBaseData: baseTodayData && baseTodayData.length > 0 
        });
      }

      // Check if we have any other entry from today (the most recent update)
      const latestResult = await supabaseAdmin
        .from('stocks')
        .select('*')
        .eq('date_day', today)
        .not('date', 'ilike', `${today}T00:%`) // Exclude midnight entries
        .order('date', { ascending: false })
        .limit(1);

      if (latestResult.error) {
        console.error('Error fetching latest stocks data:', latestResult.error);
      } else {
        latestTodayData = latestResult.data;
        console.log('Stocks API: Latest data check complete', { 
          hasLatestData: latestTodayData && latestTodayData.length > 0
        });
      }

      // Determine if we need to fetch new data
      let shouldFetch = false;
      let deleteTarget = null;

      // If we don't have a base entry for today, we should fetch
      if (!baseTodayData || baseTodayData.length === 0) {
        console.log('No base stocks data for today, fetching new data');
        shouldFetch = true;
      }

      // If we have a latest entry, check its age
      if (latestTodayData && latestTodayData.length > 0) {
        const latestTimestamp = new Date(latestTodayData[0].date);
        const timeDiff = (now.getTime() - latestTimestamp.getTime()) / 1000; // Difference in seconds
        
        // If the latest data is older than 1 hour, fetch new data
        if (timeDiff >= 3600) { // 3600 seconds = 1 hour
          console.log('Latest stocks data is older than 1 hour, fetching new data');
          shouldFetch = true;
          deleteTarget = latestTodayData[0].id; // We'll replace this entry
        }
      } else {
        // If we don't have a latest entry but we have a base entry, we should fetch a new latest
        if (baseTodayData && baseTodayData.length > 0) {
          shouldFetch = true;
        }
      }

      let finalData;
      
      // If we need fresh data, fetch it
      if (shouldFetch) {
        console.log('Stocks API: Fetching new data from Yahoo Finance');
        
        try {
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

            // Add a small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          if (stockData.length === 0) {
            throw new Error('Failed to fetch any stock data');
          }

          // If this is midnight data (within 5 minutes of midnight), mark it as base data
          const hour = now.getUTCHours();
          const minute = now.getUTCMinutes();
          const isNearMidnight = (hour === 0 && minute < 5) || (hour === 23 && minute >= 55);

          // If we're near midnight, we're creating a new base entry
          if (isNearMidnight) {
            // If we somehow have an existing base entry, delete it
            if (baseTodayData && baseTodayData.length > 0) {
              const deleteResult = await supabaseAdmin
                .from('stocks')
                .delete()
                .in('id', baseTodayData.map(item => item.id));
                
              if (deleteResult.error) {
                console.error('Error deleting base entries:', deleteResult.error);
              }
            }
          } 
          // Otherwise, we're updating the latest entry
          else if (deleteTarget) {
            // Delete the outdated latest entry
            const deleteResult = await supabaseAdmin
              .from('stocks')
              .delete()
              .eq('id', deleteTarget);
              
            if (deleteResult.error) {
              console.error('Error deleting latest entry:', deleteResult.error);
            }
          }

          // Insert new data
          const insertResult = await supabaseAdmin
            .from('stocks')
            .insert(stockData);

          if (insertResult.error) {
            console.error('Insert error:', insertResult.error);
            throw insertResult.error;
          }

          // Fetch all today's data for the response
          const newDataResult = await supabaseAdmin
            .from('stocks')
            .select('*')
            .eq('date_day', today)
            .order('date', { ascending: false });

          if (newDataResult.error) {
            console.error('Error fetching new stocks data:', newDataResult.error);
            throw newDataResult.error;
          }

          finalData = newDataResult.data;
          console.log(`Successfully fetched and saved ${finalData.length} stock records`);
        } catch (apiError) {
          console.error('API or database error:', apiError);
          
          // If we failed to fetch new data, use whatever we have in the database
          const fallbackResult = await supabaseAdmin
            .from('stocks')
            .select('*')
            .order('date', { ascending: false })
            .limit(STOCK_SYMBOLS.length);
            
          if (fallbackResult.error) {
            console.error('Error fetching fallback data:', fallbackResult.error);
            throw fallbackResult.error;
          }
          
          finalData = fallbackResult.data;
          console.log(`Using ${finalData.length} fallback stock records`);
        }
      } else {
        console.log('Using existing stocks data from DB');
        // Combine the base and latest data for the response
        const allTodayData = [
          ...(baseTodayData || []),
          ...(latestTodayData || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        finalData = allTodayData;
      }
      
      // If we have no data at all, try to get any stock data
      if (!finalData || finalData.length === 0) {
        console.log('No stock data found, fetching any available data');
        const anyDataResult = await supabaseAdmin
          .from('stocks')
          .select('*')
          .order('date', { ascending: false })
          .limit(STOCK_SYMBOLS.length);
          
        if (anyDataResult.error) {
          console.error('Error fetching any stock data:', anyDataResult.error);
        } else {
          finalData = anyDataResult.data;
        }
      }

      console.log(`Stocks API: Request complete, returning ${finalData?.length || 0} items`);
      
      // Even if there's no data, return an empty array rather than failing
      return NextResponse.json({
        success: true,
        data: finalData || [],
        errors: shouldFetch && errors.length > 0 ? errors : undefined
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Fallback to getting any stock data
      const anyResult = await supabaseAdmin
        .from('stocks')
        .select('*')
        .order('date', { ascending: false })
        .limit(STOCK_SYMBOLS.length);
        
      if (anyResult.error) {
        console.error('Error fetching any stock data:', anyResult.error);
        return NextResponse.json({
          success: true, 
          data: [],
          error: 'Database error: ' + (anyResult.error.message || 'Unknown error')
        });
      }
      
      return NextResponse.json({
        success: true,
        data: anyResult.data,
        message: 'Returned fallback data due to database error'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Stocks API Fatal Error:', errorMessage);
    
    // On complete failure, return empty data rather than a 500
    return NextResponse.json(
      { 
        success: true,
        data: [],
        error: 'Failed to fetch stock data: ' + errorMessage
      }
    );
  }
}