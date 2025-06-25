// lib/supabase/index.ts

// Export all Supabase clients for easy access
export { createClient } from './client';
export { createClient as createServerClient } from './server';
export { supabaseAdmin } from './admin';
export { updateSession } from './middleware';