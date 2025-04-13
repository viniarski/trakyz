import { createClient } from "@/lib/utils/supabase/server";
import { validateInsertFields } from "@/lib/validateInsertFields";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const allowedFields = [
    "key",
    "trial_enabled",
    "created_at",
    "updated_at",
  ] as const;

  const { id, ...inputData } = body;
  const data = validateInsertFields(inputData, allowedFields);

  if (id) {
    const { data: updated, error } = await supabase
      .from("system_settings")
      .update(data)
      .eq("id", id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updated, { status: 200 });
  }

  const { data: inserted, error } = await supabase
    .from("system_settings")
    .insert(data)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(inserted, { status: 201 });
}
