// app/api/market/crypto/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // Check the latest entry in the DB
    const { data: latestData, error: fetchError } = await supabaseAdmin
      .from('crypto')
      .select('date')
      .eq('date_day', today)
      .order('date', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching latest crypto data:', fetchError);
      throw fetchError;
    }

    // If data exists, check its age
    let shouldFetch = true;
    if (latestData && latestData.length > 0) {
      const latestTimestamp = new Date(latestData[0].date);
      const timeDiff = (now.getTime() - latestTimestamp.getTime()) / 1000; // Difference in seconds
      shouldFetch = timeDiff >= 300; // 300 seconds = 5 minutes
    }

    let finalData;
    if (shouldFetch) {
      console.log('Fetching new crypto prices for timestamp:', nowISOString);

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

      // Delete existing entries for today
      const { error: deleteError } = await supabaseAdmin
        .from('crypto')
        .delete()
        .eq('date_day', today);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      // Insert new data
      const { error: insertError } = await supabaseAdmin
        .from('crypto')
        .insert(cryptoData);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      // Fetch the newly inserted data
      const { data: newData, error: fetchNewError } = await supabaseAdmin
        .from('crypto')
        .select('*')
        .eq('date_day', today)
        .order('date', { ascending: false });

      if (fetchNewError) {
        console.error('Error fetching new crypto data:', fetchNewError);
        throw fetchNewError;
      }

      finalData = newData;
    } else {
      console.log('Using existing crypto data from DB');
      // Fetch the latest data without updating
      const { data: existingData, error: fetchExistingError } = await supabaseAdmin
        .from('crypto')
        .select('*')
        .eq('date_day', today)
        .order('date', { ascending: false });

      if (fetchExistingError) {
        console.error('Error fetching existing crypto data:', fetchExistingError);
        throw fetchExistingError;
      }

      finalData = existingData;
    }

    return NextResponse.json({
      success: true,
      data: finalData
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}