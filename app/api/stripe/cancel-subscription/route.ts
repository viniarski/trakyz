// app/api/stripe/cancel-subscription/route.ts

import { NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server";
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    console.log('API /stripe/cancel-subscription called at:', new Date().toISOString())
    
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.log('No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching user subscription data for user ID:', session.user.id)
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('id', session.user.id)
      .single()

    if (subscriptionError) {
      console.error('Supabase error fetching subscription:', subscriptionError)
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    const stripeSubscriptionId = subscriptionData?.stripe_subscription_id
    
    if (!stripeSubscriptionId) {
      console.log('No Stripe subscription ID found for user:', session.user.id)
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    console.log('Cancelling subscription:', stripeSubscriptionId)
    
    // Cancel at period end instead of immediately
    const subscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      { cancel_at_period_end: true }
    )

    console.log('Subscription updated successfully:', subscription.id)
    
    // Update the subscription status in the database
    await supabase
      .from('user_subscriptions')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error in cancel-subscription endpoint:', errorMessage, error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}