// app/api/market/crypto/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const supabase = await createClient();

    // Check the latest entry in the DB
    const { data: latestData, error: fetchError } = await supabase
      .from('crypto')
      .select('date')
      .eq('date_day', today)
      .order('date', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching latest crypto data:', fetchError);
      throw fetchError;
    }

    // Fetch the latest data
    const { data: existingData, error: fetchExistingError } = await supabase
      .from('crypto')
      .select('*')
      .eq('date_day', today)
      .order('symbol', { ascending: true });

    if (fetchExistingError) {
      console.error('Error fetching existing crypto data:', fetchExistingError);
      throw fetchExistingError;
    }

    if (existingData && existingData.length > 0) {
      console.log('Found today\'s crypto data in DB');
      return NextResponse.json({
        success: true,
        data: existingData
      });
    }

    // If we don't have today's data, check if we can find the most recent data
    const { data: recentData, error: recentError } = await supabase
      .from('crypto')
      .select('*')
      .order('date', { ascending: false })
      .limit(30); // Get the most recent crypto data for up to 30 coins

    if (!recentError && recentData && recentData.length > 0) {
      console.log('Using most recent crypto data from DB');
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
      { error: 'Failed to fetch crypto data' },
      { status: 500 }
    );
  }
}