// app/api/admin/sync-admin-emails/route.ts

import { NextResponse } from 'next/server';
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    // Check if the requester is already an admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the user is an admin
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }
    
    // Get the admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS || '';
    
    // Update the database with the admin emails
    const { error } = await supabaseAdmin
      .from('system_admin_settings')
      .upsert(
        { 
          key: 'admin_emails', 
          value: adminEmails,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key' }
      );
      
    if (error) {
      console.error('Error updating admin emails:', error);
      return NextResponse.json({ error: 'Failed to update admin emails' }, { status: 500 });
    }
    
    // Run the function to update existing users
    await supabaseAdmin.rpc('update_admin_roles');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin emails synced successfully',
      adminEmails: adminEmails.split(',').map(e => e.trim())
    });
  } catch (error) {
    console.error('Error in sync-admin-emails endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}