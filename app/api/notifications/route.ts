import { createClient } from "@/lib/utils/supabase/server";
import { validateInsertFields } from "@/lib/validateInsertFields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const userId = req.headers.get("x-user-id");

  const allowedFields = [
    "user_id",
    "type",
    "title",
    "message",
    "is_read",
    "created_at",
  ] as const;

  const { id, ...inputData } = body;
  const data = validateInsertFields(inputData, allowedFields);

  // Ensure user_id is correctly set
  data.user_id = userId;

  if (id) {
    const { data: updated, error } = await supabase
      .from("notifications")
      .update(data)
      .eq("id", id)
      .eq("user_id", userId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updated, { status: 200 });
  }

  const { data: inserted, error } = await supabase
    .from("notifications")
    .insert(data)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
