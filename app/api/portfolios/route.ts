// app/api/portfolios/route.ts

import { createClient } from "@/lib/utils/supabase/server";
import { validateInsertFields } from "@/lib/validateInsertFields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const userId = req.headers.get("x-user-id");

  const allowedFields = [
    "user_id",
    "name",
    "is_default",
    "total_value",
    "total_cost",
    "total_profit_loss",
    "total_profit_loss_percentage",
    "asset_count",
  ] as const;

  const { id, ...inputData } = body;
  const data = validateInsertFields(inputData, allowedFields);
  data.user_id = userId;

  // If ID exists, update the existing record
  if (id) {
    const { data: updated, error } = await supabase
      .from("portfolios")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId) // Ensure users can only update their own cards
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updated, { status: 200 });
  }

  // Otherwise insert a new record
  const { data: inserted, error } = await supabase
    .from("portfolios")
    .insert(data)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
