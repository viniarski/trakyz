// app/api/user-subscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";
import { validateInsertFields } from "@/lib/validateInsertFields";

const allowedFields = [
  "subscription_start_date",
  "subscription_end_date",
  "stripe_customer_id",
  "stripe_subscription_id",
  "subscription_status",
  "is_trial",
  "trial_ending_notified",
  "trial_until"
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
  }

  const body = await req.json();

  // Filter body to include only allowed fields
  const filteredData = validateInsertFields(body, allowedFields);

  // Add the user ID (it's the primary key here)
  const dataWithUserId = { id: userId, ...filteredData };

  // Check if a row already exists for this user
  const { data: existing, error: fetchError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  let result;
  if (existing) {
    // Update existing
    result = await supabase
      .from("user_subscriptions")
      .update(filteredData)
      .eq("id", userId)
      .select();
  } else {
    // Insert new
    result = await supabase
      .from("user_subscriptions")
      .insert(dataWithUserId)
      .select();
  }

  const { data, error } = result;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}