// app/api/stripe/create-checkout/route.ts

import { NextResponse } from 'next/server'
import { createClient } from "@/lib/utils/supabase/server";
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    console.log('API /stripe/create-checkout called at:', new Date().toISOString())
    
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      console.log('No user session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()
    console.log('Request body:', { priceId })
    if (!priceId || typeof priceId !== 'string') {
      console.log('Invalid or missing priceId')
      return NextResponse.json({ error: 'Price ID is required and must be a string' }, { status: 400 })
    }

    console.log('Fetching user data for user ID:', session.user.id)
    // First, check if the user already has a subscription record
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single()

    let customerId = existingSubscription?.stripe_customer_id
    
    // If no existing customer ID, check the user's profile and create a new Stripe customer
    if (!customerId) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Error fetching user:', userError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      console.log('Creating new Stripe customer')
      const customer = await stripe.customers.create({
        email: userData.user.email,
        name: userData.user.user_metadata?.full_name,
        metadata: { userId: session.user.id },
      })
      customerId = customer.id
      console.log('New customer created:', customerId)
      
      // Insert a new record in user_subscriptions
      await supabase
        .from('user_subscriptions')
        .insert({ 
          id: session.user.id, 
          stripe_customer_id: customerId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    }

    console.log('Creating checkout session for customer:', customerId)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout_success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?checkout_cancelled=true`,
      subscription_data: { metadata: { userId: session.user.id } },
      metadata: { userId: session.user.id },
    })

    console.log('Checkout session created:', checkoutSession.url)
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error creating checkout session:', errorMessage, error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}