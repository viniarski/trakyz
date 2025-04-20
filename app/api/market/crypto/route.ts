// app/api/market/crypto/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We need direct access to Supabase with admin privileges
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

interface CoinGeckoPrice {
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
}

export async function GET() {
  try {
    const now = new Date();
    const nowISOString = now.toISOString();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Crypto API: Starting request', { today });
    
    // Check if we have today's base (00:00) entry
    let baseTodayData = null;
    let latestTodayData = null;
    
    try {
      const baseResult = await supabaseAdmin
        .from('crypto')
        .select('*')
        .eq('date_day', today)
        .ilike('date', `${today}T00:%`) // Match entries close to midnight
        .order('date', { ascending: false })
        .limit(1);

      if (baseResult.error) {
        console.error('Error fetching base crypto data:', baseResult.error);
      } else {
        baseTodayData = baseResult.data;
        console.log('Crypto API: Base data check complete', { 
          hasBaseData: baseTodayData && baseTodayData.length > 0 
        });
      }

      // Check if we have any other entry from today (the most recent update)
      const latestResult = await supabaseAdmin
        .from('crypto')
        .select('*')
        .eq('date_day', today)
        .not('date', 'ilike', `${today}T00:%`) // Exclude midnight entries
        .order('date', { ascending: false })
        .limit(1);

      if (latestResult.error) {
        console.error('Error fetching latest crypto data:', latestResult.error);
      } else {
        latestTodayData = latestResult.data;
        console.log('Crypto API: Latest data check complete', { 
          hasLatestData: latestTodayData && latestTodayData.length > 0
        });
      }

      // Determine if we need to fetch new data
      let shouldFetch = false;
      let deleteTarget = null;

      // If we don't have a base entry for today, we should fetch
      if (!baseTodayData || baseTodayData.length === 0) {
        console.log('No base crypto data for today, fetching new data');
        shouldFetch = true;
      }

      // If we have a latest entry, check its age
      if (latestTodayData && latestTodayData.length > 0) {
        const latestTimestamp = new Date(latestTodayData[0].date);
        const timeDiff = (now.getTime() - latestTimestamp.getTime()) / 1000; // Difference in seconds
        
        // If the latest data is older than 5 minutes, fetch new data
        if (timeDiff >= 300) { // 300 seconds = 5 minutes
          console.log('Latest crypto data is older than 5 minutes, fetching new data');
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
      
      if (shouldFetch) {
        console.log('Crypto API: Fetching new data from CoinGecko');
        
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1'
          );

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          const cryptoData = data.map((coin: CoinGeckoPrice) => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            date: nowISOString,
            price: coin.current_price,
            market_cap: coin.market_cap,
            volume_24h: coin.total_volume,
            date_day: today
          }));

          // If this is midnight data (within 5 minutes of midnight), mark it as base data
          const hour = now.getUTCHours();
          const minute = now.getUTCMinutes();
          const isNearMidnight = (hour === 0 && minute < 5) || (hour === 23 && minute >= 55);

          // If we're near midnight, we're creating a new base entry
          if (isNearMidnight) {
            // If we somehow have an existing base entry, delete it
            if (baseTodayData && baseTodayData.length > 0) {
              const deleteResult = await supabaseAdmin
                .from('crypto')
                .delete()
                .in('id', baseTodayData.map(item => item.id));
                
              if (deleteResult.error) {
                console.error('Error deleting base entry:', deleteResult.error);
              }
            }
          } 
          // Otherwise, we're updating the latest entry
          else if (deleteTarget) {
            // Delete the outdated latest entry
            const deleteResult = await supabaseAdmin
              .from('crypto')
              .delete()
              .eq('id', deleteTarget);
              
            if (deleteResult.error) {
              console.error('Error deleting latest entry:', deleteResult.error);
            }
          }

          // Insert new data
          const insertResult = await supabaseAdmin
            .from('crypto')
            .insert(cryptoData);

          if (insertResult.error) {
            console.error('Insert error:', insertResult.error);
            throw insertResult.error;
          }

          // Fetch all today's data for the response
          const newDataResult = await supabaseAdmin
            .from('crypto')
            .select('*')
            .eq('date_day', today)
            .order('date', { ascending: false });

          if (newDataResult.error) {
            console.error('Error fetching new crypto data:', newDataResult.error);
            throw newDataResult.error;
          }

          finalData = newDataResult.data;
          console.log(`Successfully fetched and saved ${finalData.length} crypto records`);
        } catch (apiError) {
          console.error('API or database error:', apiError);
          
          // If we failed to fetch new data, use whatever we have in the database
          const fallbackResult = await supabaseAdmin
            .from('crypto')
            .select('*')
            .order('date', { ascending: false })
            .limit(30);
            
          if (fallbackResult.error) {
            console.error('Error fetching fallback data:', fallbackResult.error);
            throw fallbackResult.error;
          }
          
          finalData = fallbackResult.data;
          console.log(`Using ${finalData.length} fallback crypto records`);
        }
      } else {
        console.log('Using existing crypto data from DB');
        // Combine the base and latest data for the response
        const allTodayData = [
          ...(baseTodayData || []),
          ...(latestTodayData || [])
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        finalData = allTodayData;
      }
      
      // If we have no data at all, try to get any crypto data
      if (!finalData || finalData.length === 0) {
        console.log('No crypto data found, fetching any available data');
        const anyDataResult = await supabaseAdmin
          .from('crypto')
          .select('*')
          .order('date', { ascending: false })
          .limit(30);
          
        if (anyDataResult.error) {
          console.error('Error fetching any crypto data:', anyDataResult.error);
        } else {
          finalData = anyDataResult.data;
        }
      }

      console.log(`Crypto API: Request complete, returning ${finalData?.length || 0} items`);
      
      // Even if there's no data, return an empty array rather than failing
      return NextResponse.json({
        success: true,
        data: finalData || []
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Fallback to getting any crypto data
      const anyResult = await supabaseAdmin
        .from('crypto')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);
        
      if (anyResult.error) {
        console.error('Error fetching any crypto data:', anyResult.error);
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
    console.error('Crypto API Fatal Error:', errorMessage);
    
    // On complete failure, return empty data rather than a 500
    return NextResponse.json(
      { 
        success: true,
        data: [],
        error: 'Failed to fetch crypto data: ' + errorMessage
      }
    );
  }
}