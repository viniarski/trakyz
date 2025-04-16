// app/page.tsx

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// This prevents static optimization during build
export const dynamic = "force-dynamic";

export default async function Home() {
  // Check if user is authenticated
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If the user is logged in, redirect to the dashboard
  if (user) {
    return redirect("/dashboard");
  }

  // For non-authenticated users, redirect to the welcome page
  return redirect("/welcome");
}
