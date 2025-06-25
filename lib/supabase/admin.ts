// lib/supabase/admin.ts

import { createClient } from '@supabase/supabase-js'

/**
 * Environment validation
 */
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY')
}

/**
 * Create a Supabase admin client with service role permissions
 * This client bypasses RLS policies and should only be used for admin operations
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * A wrapper function to interact with admin client
 * Gives the option to use service role permissions only when needed
 * @returns Supabase admin client
 */
export const createAdminClient = () => supabaseAdmin;