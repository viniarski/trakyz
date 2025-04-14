// app/api/auth/check-admin/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    // Get the user ID from the request
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS || '';
    if (!adminEmails) {
      console.log('No admin emails configured');
      return NextResponse.json({ success: false });
    }
    
    // Get the user from Supabase
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData?.user) {
      console.error('Error getting user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const email = userData.user.email;
    if (!email) {
      return NextResponse.json({ error: 'User has no email' }, { status: 400 });
    }
    
    // Check if this email should be an admin
    const adminEmailList = adminEmails.split(',').map(e => e.trim().toLowerCase());
    const shouldBeAdmin = adminEmailList.includes(email.toLowerCase());
    
    // If user should be admin, update their role
    if (shouldBeAdmin) {
      console.log(`Setting admin role for user: ${email}`);
      
      // Update the user_profiles table
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
        
      if (updateError) {
        console.error('Error updating user role:', updateError);
        return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, isAdmin: true });
    }
    
    return NextResponse.json({ success: true, isAdmin: false });
  } catch (error) {
    console.error('Error in check-admin endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}