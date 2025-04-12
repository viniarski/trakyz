// app/api/stripe/create-portal/route.ts

import { NextResponse } from 'next/server'
import { createClient } from "@/lib/utils/supabase/server";
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    console.log('API /stripe/create-portal called at:', new Date().toISOString())
    
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.log('No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Fetching user subscription data for user ID:', session.user.id)
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    console.log('Supabase subscription data:', subscriptionData, 'Error:', subscriptionError)
    if (subscriptionError) {
      console.error('Supabase error fetching subscription:', subscriptionError)
      // No subscription record means the user hasn't subscribed yet
      return NextResponse.json({ redirect: `${process.env.NEXT_PUBLIC_APP_URL}/pricing` }, { status: 200 })
    }

    console.log('Subscription data retrieved:', { stripe_customer_id: subscriptionData?.stripe_customer_id })
    if (!subscriptionData?.stripe_customer_id) {
      console.log('No Stripe customer ID found for user:', session.user.id)
      return NextResponse.json({ redirect: `${process.env.NEXT_PUBLIC_APP_URL}/pricing` }, { status: 200 })
    }

    console.log('Creating portal session for customer:', subscriptionData.stripe_customer_id)
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscriptionData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    })

    console.log('Portal session created successfully:', portalSession.url)
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Error in create-portal endpoint:', errorMessage, error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}