// app/settings/page.tsx

import { UserResponse } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Settings from "./components/Settings";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  }: UserResponse = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch subscription data
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("user_subscriptions")
    .select(
      "subscription_status, subscription_end_date, stripe_subscription_id"
    )
    .eq("id", user.id)
    .single();

  if (subscriptionError) {
    console.error("Error loading subscription data:", subscriptionError);
  }

  return (
    <Settings
      user={user}
      subscriptionData={
        subscriptionData
          ? {
              status: subscriptionData.subscription_status || "inactive",
              currentPeriodEnd: subscriptionData.subscription_end_date,
              cancelAtPeriodEnd: false, // Placeholder; add logic if needed
            }
          : null
      }
    />
  );
}
