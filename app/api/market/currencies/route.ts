// app/api/market/currencies/route.ts

import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking currency rates for date:', today);
    
    const supabase = await createClient();

    // Always try to get data from the database first
    const { data: todaysPrices, error: dbError } = await supabase
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
    const { data: recentPrices, error: recentError } = await supabase
      .from('currencies')
      .select('*')
      .order('date', { ascending: false })
      .limit(18); // Get the most recent currency rates

    if (!recentError && recentPrices && recentPrices.length > 0) {
      console.log('Using most recent currency rates from DB');
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