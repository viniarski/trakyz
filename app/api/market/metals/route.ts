// app/api/market/metals/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking metals prices for date:', today);

    // Always try to get data from the database first
    const { data: todaysPrices, error: dbError } = await supabaseAdmin
      .from('metals')
      .select('*')
      .eq('date', today);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    if (todaysPrices && todaysPrices.length > 0) {
      console.log('Found today\'s metals prices in DB');
      return NextResponse.json({
        success: true,
        data: todaysPrices
      });
    }

    // If we don't have today's data, check if we can find the most recent data
    const { data: recentPrices, error: recentError } = await supabaseAdmin
      .from('metals')
      .select('*')
      .order('date', { ascending: false })
      .limit(4); // Get the most recent metal prices (4 because we have 4 metals)

    if (!recentError && recentPrices && recentPrices.length > 0) {
      console.log('Using most recent metals prices from DB');
      return NextResponse.json({
        success: true,
        data: recentPrices
      });
    }

    // If we still don't have data, this is likely a new installation or empty DB
    // In this case only, we'll fetch from the API as a fallback
    console.log('No metals data in DB, fetching from API as fallback');
    const response = await fetch(
      `${process.env.METALS_API_URL}/latest?api_key=${process.env.METALS_API_KEY}&currency=USD&unit=toz`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const metals = ['gold', 'silver', 'platinum', 'palladium'];
    
    const newPrices = metals.map(metal => ({
      metal,
      date: today,
      price: data.metals?.[metal] || 0
    }));

    // Save the data for future use
    const { error: insertError } = await supabaseAdmin
      .from('metals')
      .insert(newPrices);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      data: newPrices
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metals data' },
      { status: 500 }
    );
  }
}