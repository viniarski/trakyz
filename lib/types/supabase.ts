// lib/types/supabase.ts

// this is the type format that the {User} import outputs from @supabase/supabase-js
// leaving it here for future reference (can be deleted later)

export interface SupabaseUser {
  id: string; // UUID of the user
  aud: string; // Audience claim (typically "authenticated")
  role: string; // Role assigned to the user (e.g., "authenticated")
  email: string | null;
  phone: string | null;
  created_at: string; // ISO timestamp
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  app_metadata: Record<string, any>; // Metadata from authentication provider
  user_metadata: Record<string, any>; // Custom user metadata
  identities?: Array<{
    id: string;
    identity_data: Record<string, any>;
    provider: string; // e.g., "google", "github"
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
  }>;
}
