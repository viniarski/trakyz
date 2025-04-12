// /app/api/stripe/verify-session/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/utils/supabase/server";
import { stripe } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get the current user session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (!checkoutSession) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

    // Verify session belongs to this user
    if (checkoutSession.metadata?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    return NextResponse.json({ success: true, session: checkoutSession });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}