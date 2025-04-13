import { UserResponse } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/utils/supabase/server";
import System from "./components/System";
import { Notifications, SystemSetting } from "@/lib/types/systemTypes";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  }: UserResponse = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch system settings
  const { data: systemData, error: systemError } = await supabase
    .from("system_settings")
    .select("*");

  if (systemError) {
    console.error("Error fetching system settings:", systemError);
  }

  // Fetch notifications
  const { data: notificationData, error: notificationError } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id);

  if (notificationError) {
    console.error("Error fetching notifications:", notificationError);
  }

  return (
    <System
      systemSettings={(systemData || []) as SystemSetting[]}
      notifications={(notificationData || []) as Notifications[]}
    />
  );
}
