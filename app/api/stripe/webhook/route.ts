// app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/utils/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: Request) {
  console.log('Webhook request received:', new Date().toISOString(), 'URL:', request.url)
  
  const body = await request.text()
  // Avoid logging full body in production as it may contain sensitive data
  console.log('Webhook body received, length:', body.length)

  // Get the headers asynchronously
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature')
  console.log('Webhook signature:', signature)

  if (!signature) {
    console.error('Missing Stripe-Signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET in environment')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    console.log('Webhook event verified:', event.type, 'ID:', event.id)
  } catch (err) {
    console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error')
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Processing checkout.session.completed:', session.id)
        if (session.mode !== 'subscription') {
          console.log('Not a subscription event, skipping:', session.mode)
          break
        }
        const userId = session.metadata?.userId
        const planType = session.metadata?.planType
        console.log('Metadata:', { userId, planType })
        if (!userId || !planType) {
          console.error('Missing metadata in checkout session:', session.id)
          break
        }
        
        if (!session.subscription) {
          console.error('Missing subscription ID in session:', session.id)
          break
        }
        
        console.log('Fetching subscription for:', session.subscription)
        
        // Get the subscription details and cast to proper type
        const subscriptionDetails = await stripe.subscriptions.retrieve(
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id
        )
        
        console.log('Updating user:', userId, 'to plan:', planType)
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: typeof session.subscription === 'string' 
              ? session.subscription 
              : session.subscription.id,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            // Safely access the end date
            subscription_end_date: new Date((subscriptionDetails as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
        
        if (error) {
          console.error('Error updating user after checkout:', error.message)
          throw error
        }
        console.log('User updated successfully:', data)
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Processing customer.subscription.created:', subscription.id)
        const userId = subscription.metadata?.userId
        if (!userId) {
          console.error('Missing userId in subscription metadata:', subscription.id)
          break
        }
        console.log('Updating user:', userId, 'subscription created')
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_start_date: new Date(subscription.start_date * 1000).toISOString(),
            // Access as any to bypass TypeScript checking
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
        if (error) {
          console.error('Error updating user on subscription created:', error.message)
          throw error
        }
        console.log('User updated successfully:', data)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Processing customer.subscription.updated:', subscription.id)
        
        // Find the user by subscription ID
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscription.id, userError.message)
          break
        }
        
        const userId = userData.id
        console.log('Updating user subscription for:', userId)
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: subscription.status,
            // Access as any to bypass TypeScript checking
            subscription_end_date: new Date((subscription as any).current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          
        if (error) {
          console.error('Error updating user on subscription updated:', error.message)
          throw error
        }
        
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Processing customer.subscription.deleted:', subscription.id)
        
        // Find the user by subscription ID
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscription.id)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscription.id, userError.message)
          break
        }
        
        const userId = userData.id
        console.log('Updating user subscription for:', userId)
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: 'canceled',
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId)
          .select()
          
        if (error) {
          console.error('Error updating user on subscription deleted:', error.message)
          throw error
        }
        
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'invoice.payment_succeeded': {
        // Use any for the invoice object to bypass TypeScript checking
        const invoice = event.data.object as any
        console.log('Processing invoice.payment_succeeded:', invoice.id)
        
        // Check if the invoice has a subscription
        if (!invoice.subscription) {
          console.log('No subscription ID in invoice:', invoice.id)
          break
        }
        
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id
        
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscriptionId, userError.message)
          break
        }
        
        console.log('Updating user subscription for:', userData.id, 'payment succeeded')
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id)
          .select()
          
        if (error) {
          console.error('Error updating user on payment succeeded:', error.message)
          throw error
        }
        
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'invoice.payment_failed': {
        // Use any for the invoice object to bypass TypeScript checking
        const invoice = event.data.object as any
        console.log('Processing invoice.payment_failed:', invoice.id)
        
        // Check if the invoice has a subscription
        if (!invoice.subscription) {
          console.log('No subscription ID in invoice:', invoice.id)
          break
        }
        
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id
        
        const { data: userData, error: userError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscriptionId, userError.message)
          break
        }
        
        console.log('Updating user subscription for:', userData.id, 'payment failed')
        
        const { data, error } = await supabaseAdmin
          .from('user_subscriptions')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('id', userData.id)
          .select()
          
        if (error) {
          console.error('Error updating user on payment failed:', error.message)
          throw error
        }
        
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'checkout.session.expired': {
        console.log('Processing checkout.session.expired:', event.data.object.id)
        // No DB update needed; log for tracking
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Webhook handler error:', errorMessage, error)
    return NextResponse.json({ error: 'Webhook handler failed: ' + errorMessage }, { status: 500 })
  }
}

export const config = {
  api: { bodyParser: false },
}