// lib/utils/supabase/service.ts

import { createClient } from "@supabase/supabase-js";

export const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// used server side for bypassing RLS
// actions such as inserting user_id directly
