// app/api/user-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

//  Make a request here to either insert a new user profile or update existing fields dynamically.
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");

  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    // Extract headers dynamically (excluding static fields)
    const headers = req.headers;
    const allowedFields = [
      "name",
      "role",
      "avatar_url",
      "selected_currency",
      "selected_period",
      "theme_preference",
      "last_active_tab",
      "language",
      "market_show_more",
    ];

    let updateFields: Record<string, any> = {};

    // Loop through allowed fields and populate `updateFields`
    for (const field of allowedFields) {
      const value = headers.get(field);
      if (value !== null) {
        updateFields[field] = value;
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    //  Upsert user profile (insert if not exists, update if exists)
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert([{ id: userId, ...updateFields }], { onConflict: "id" })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
