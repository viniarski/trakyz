// app/api/market/currencies/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

const CURRENCY_PAIRS = [
  // Major currencies
  { symbol: 'EUR', name: 'Euro' },
  { symbol: 'GBP', name: 'British Pound' },
  { symbol: 'JPY', name: 'Japanese Yen' },
  { symbol: 'CHF', name: 'Swiss Franc' },
  { symbol: 'AUD', name: 'Australian Dollar' },
  { symbol: 'CAD', name: 'Canadian Dollar' },
  
  // BRICS and emerging markets
  { symbol: 'CNY', name: 'Chinese Yuan' },
  { symbol: 'PLN', name: 'Polish Złoty' },
  { symbol: 'NOK', name: 'Norwegian Krone' },
  { symbol: 'BRL', name: 'Brazilian Real' },
  { symbol: 'RUB', name: 'Russian Ruble' },
  { symbol: 'INR', name: 'Indian Rupee' },
  
  // Other important currencies
  { symbol: 'SGD', name: 'Singapore Dollar' },
  { symbol: 'NZD', name: 'New Zealand Dollar' },
  { symbol: 'HKD', name: 'Hong Kong Dollar' },
  { symbol: 'SEK', name: 'Swedish Krona' },
  { symbol: 'MXN', name: 'Mexican Peso' },
  { symbol: 'ZAR', name: 'South African Rand' }
];

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking currency rates for date:', today);

    // Always try to get data from the database first
    const { data: todaysPrices, error: dbError } = await supabaseAdmin
      .from('currencies')
      .select('*')
      .eq('date', today);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (todaysPrices && todaysPrices.length > 0) {
      console.log('Found today\'s currency rates in DB');
      return NextResponse.json({
        success: true,
        data: todaysPrices
      });
    }

    // If we don't have today's data, check if we can find the most recent data
    const { data: recentPrices, error: recentError } = await supabaseAdmin
      .from('currencies')
      .select('*')
      .order('date', { ascending: false })
      .limit(CURRENCY_PAIRS.length); // Get the most recent currency rates

    if (!recentError && recentPrices && recentPrices.length > 0) {
      console.log('Using most recent currency rates from DB');
      return NextResponse.json({
        success: true,
        data: recentPrices
      });
    }

    // If we still don't have data, this is likely a new installation or empty DB
    // In this case only, we'll fetch from the API as a fallback
    console.log('No currency data in DB, fetching from API as fallback');
    
    try {
      const response = await fetch(
        `${process.env.FOREX_API_URL}/latest.json?app_id=${process.env.FOREX_API_KEY}&base=USD`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      const currencyData = CURRENCY_PAIRS.map(pair => ({
        symbol: pair.symbol,
        name: pair.name,
        date: today,
        price: 1 / (data.rates[pair.symbol] || 1)
      }));

      // Save the data for future use
      const { error: insertError } = await supabaseAdmin
        .from('currencies')
        .insert(currencyData);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      return NextResponse.json({
        success: true,
        data: currencyData
      });

    } catch (apiError) {
      console.error('API call error:', apiError);
      throw apiError;
    }

  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch currency data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}