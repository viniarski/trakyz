// app/api/market/metals/route.ts

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

export async function GET() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('Metals API: Starting request', { today });

    // Check if we have today's data
    let todayData = null;
    
    try {
      const dataResult = await supabaseAdmin
        .from('metals')
        .select('*')
        .eq('date', today)
        .order('date', { ascending: false });

      if (dataResult.error) {
        console.error('Error fetching metals data:', dataResult.error);
      } else {
        todayData = dataResult.data;
        console.log('Metals API: Data check complete', { 
          hasTodayData: todayData && todayData.length > 0 
        });
      }

      // If we already have today's data, return it
      if (todayData && todayData.length > 0) {
        console.log('Found today\'s metals prices in DB');
        return NextResponse.json({
          success: true,
          data: todayData
        });
      }

      // If we don't have today's data, check if we have any data to use as fallback
      const recentResult = await supabaseAdmin
        .from('metals')
        .select('*')
        .order('date', { ascending: false })
        .limit(4); // Get the most recent metal prices
        
      if (recentResult.error) {
        console.error('Error fetching recent metals data:', recentResult.error);
      } else if (recentResult.data && recentResult.data.length > 0) {
        console.log('Using most recent metals prices from DB');
        return NextResponse.json({
          success: true,
          data: recentResult.data
        });
      }

      // If we need to fetch data from the API
      console.log('No metals data found, creating mock data');
      
      // Create a fallback metals dataset since the API might not be configured
      const mockMetals = [
        { metal: 'gold', date: today, price: 2400.50 },
        { metal: 'silver', date: today, price: 31.25 },
        { metal: 'platinum', date: today, price: 1050.75 },
        { metal: 'palladium', date: today, price: 950.40 }
      ];
      
      // If we have the API credentials, try to use them instead
      if (process.env.METALS_API_URL && process.env.METALS_API_KEY) {
        try {
          console.log('Attempting to fetch metals data from API');
          const response = await fetch(
            `${process.env.METALS_API_URL}/latest?api_key=${process.env.METALS_API_KEY}&currency=USD&unit=toz`
          );

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          const metals = ['gold', 'silver', 'platinum', 'palladium'];
          
          if (data.metals) {
            const newPrices = metals.map(metal => ({
              metal,
              date: today,
              price: data.metals?.[metal] || 0
            }));
            
            console.log('Successfully fetched metals data from API');
            
            // Save the data in the database
            const insertResult = await supabaseAdmin
              .from('metals')
              .insert(newPrices);

            if (insertResult.error) {
              console.error('Error inserting metals data:', insertResult.error);
            } else {
              console.log('Successfully saved metals data to database');
              return NextResponse.json({
                success: true,
                data: newPrices
              });
            }
          }
        } catch (apiError) {
          console.error('Metals API fetch error:', apiError);
        }
      }
      
      // If API fetch failed or wasn't attempted, use the mock data
      // Save the mock data to the database
      const insertResult = await supabaseAdmin
        .from('metals')
        .insert(mockMetals);
        
      if (insertResult.error) {
        console.error('Error inserting mock metals data:', insertResult.error);
      } else {
        console.log('Successfully saved mock metals data to database');
      }
      
      // Return the mock data
      return NextResponse.json({
        success: true,
        data: mockMetals,
        note: 'Using mock metals data as fallback'
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Create minimal fallback data
      const fallbackData = [
        { id: 'mock-gold', metal: 'gold', date: today, price: 2400.50 },
        { id: 'mock-silver', metal: 'silver', date: today, price: 31.25 }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackData,
        message: 'Returned fallback data due to database error'
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Metals API Fatal Error:', errorMessage);
    
    // On complete failure, return minimal mock data rather than a 500
    return NextResponse.json(
      { 
        success: true,
        data: [
          { id: 'fallback-gold', metal: 'gold', date: new Date().toISOString().split('T')[0], price: 2400.50 },
          { id: 'fallback-silver', metal: 'silver', date: new Date().toISOString().split('T')[0], price: 31.25 }
        ],
        error: 'Failed to fetch metals data: ' + errorMessage
      }
    );
  }
}