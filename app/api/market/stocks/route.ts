// app/api/market/stocks/route.ts

import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const supabase = await createClient();

    // Check the latest entry in the DB
    const { data: latestData, error: fetchError } = await supabase
      .from('stocks')
      .select('date')
      .eq('date_day', today)
      .order('date', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching latest stocks data:', fetchError);
      throw fetchError;
    }

    // Fetch the latest data
    const { data: existingData, error: fetchExistingError } = await supabase
      .from('stocks')
      .select('*')
      .eq('date_day', today)
      .order('symbol', { ascending: true });

    if (fetchExistingError) {
      console.error('Error fetching existing stocks data:', fetchExistingError);
      throw fetchExistingError;
    }

    if (existingData && existingData.length > 0) {
      console.log('Found today\'s stocks data in DB');
      return NextResponse.json({
        success: true,
        data: existingData
      });
    }

    // If we don't have today's data, check if we can find the most recent data
    const { data: recentData, error: recentError } = await supabase
      .from('stocks')
      .select('*')
      .order('date', { ascending: false })
      .limit(20); // Get the most recent stock data for up to 20 stocks

    if (!recentError && recentData && recentData.length > 0) {
      console.log('Using most recent stocks data from DB');
      return NextResponse.json({
        success: true,
        data: recentData
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
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}