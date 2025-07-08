// app/api/transactions/route.ts

import { createClient } from "@/lib/supabase/server";
import { validateInsertFields } from "@/lib/utils/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get('portfolio_id');

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    // Filter by portfolio if specified
    if (portfolioId) {
      query = query.eq("portfolio_id", portfolioId);
    }

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('Error in transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const allowedFields = [
      "portfolio_id",
      "category",
      "asset_type",
      "transaction_type",
      "quantity",
      "price",
      "date",
      "encrypted",
    ] as const;

    const { id, ...inputData } = body;
    
    // Validate input data
    const data: any = {};
    for (const field of allowedFields) {
      if (inputData[field] !== undefined) {
        data[field] = inputData[field];
      }
    }
    
    // Always set the user_id from the authenticated user
    data.user_id = user.id;

    // If ID exists, update the existing record
    if (id) {
      const { data: updated, error } = await supabase
        .from("transactions")
        .update(data)
        .eq("id", id)
        .eq("user_id", user.id) // Ensure users can only update their own transactions
        .select();

      if (error) {
        console.error('Error updating transaction:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(updated, { status: 200 });
    }

    // Otherwise insert a new record
    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(data)
      .select();

    if (error) {
      console.error('Error inserting transaction:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error('Error in POST transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}