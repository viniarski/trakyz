// middleware.ts

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/utils/supabase/middleware";
import { supabaseAdmin } from "@/lib/utils/supabase/admin";

export async function middleware(request: NextRequest) {
  const authResponse = await updateSession(request);
  
  // Check for auth callback with new user
  const requestUrl = new URL(request.url);
  
  // If this is an auth callback and there's a code, check if user needs admin role
  if (requestUrl.pathname === '/auth/callback' && requestUrl.searchParams.has('code')) {
    try {
      // Get the admin emails from environment variable
      const adminEmails = process.env.ADMIN_EMAILS || '';
      if (!adminEmails) {
        console.log('No admin emails configured');
        return authResponse;
      }
      
      // Create supabase admin client
      // Reuse the existing client if it's available in the request
      const responseUrl = authResponse.headers.get('location') || '';
      
      // Wait a moment for auth to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the user and check if they need admin role
      const supabase = supabaseAdmin;
      
      // Get latest users - this is a bit of a workaround since we don't have the session yet
      const { data: latestUsers, error } = await supabase
        .from('user_profiles')
        .select('id, name, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error('Error fetching users:', error);
        return authResponse;
      }
      
      // For each recent user, check if they should be an admin
      for (const user of latestUsers) {
        // Get the full user record from auth.users
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user.id);
        
        if (userError || !userData?.user) {
          console.error('Error getting user:', userError);
          continue;
        }
        
        const email = userData.user.email;
        if (!email) continue;
        
        // Check if this email should be an admin
        const adminEmailList = adminEmails.split(',').map(e => e.trim().toLowerCase());
        const shouldBeAdmin = adminEmailList.includes(email.toLowerCase());
        
        // If user should be admin but isn't marked as one yet
        if (shouldBeAdmin && user.role !== 'admin') {
          console.log(`Setting admin role for user: ${email}`);
          
          // Update the user_profiles table
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating user role:', updateError);
          }
        }
      }
    } catch (err) {
      console.error('Error in admin role check middleware:', err);
    }
  }
  
  return authResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};