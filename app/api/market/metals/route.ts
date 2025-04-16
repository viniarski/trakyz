// app/api/market/metals/route.ts

import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking metals prices for date:', today);

    const supabase = await createClient();

    // Always try to get data from the database first
    const { data: todaysPrices, error: dbError } = await supabase
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
    const { data: recentPrices, error: recentError } = await supabase
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
    // Return an empty array with success status
    return NextResponse.json({
      success: true,
      data: []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metals data' },
      { status: 500 }
    );
  }
}