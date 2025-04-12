// app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseService } from '@/lib/utils/supabase/service'

// Define explicit types for the webhook event objects to avoid type errors
interface StripeCheckoutSession {
  id: string;
  mode?: string;
  metadata?: {
    userId?: string;
  };
  customer?: string;
  subscription?: string;
}

interface StripeSubscription {
  id: string;
  status: string;
  metadata?: {
    userId?: string;
  };
  start_date: number;
  current_period_end: number;
}

interface StripeInvoice {
  id: string;
  subscription?: string;
}

export async function POST(request: Request) {
  console.log('Webhook request received:', new Date().toISOString(), 'URL:', request.url)
  
  const body = await request.text()
  // Avoid logging full body in production as it may contain sensitive data
  console.log('Webhook body received, length:', body.length)

  // Use headers() synchronously (it's not a Promise)
  const headersList = headers()
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

  let event: any;
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
        // Use our custom type instead of Stripe.Checkout.Session
        const session = event.data.object as StripeCheckoutSession
        console.log('Processing checkout.session.completed:', session.id)
        
        if (session.mode !== 'subscription') {
          console.log('Not a subscription event, skipping:', session.mode)
          break
        }
        
        const userId = session.metadata?.userId
        console.log('Metadata:', { userId })
        if (!userId) {
          console.error('Missing userId in checkout session:', session.id)
          break
        }
        
        console.log('Fetching subscription for:', session.subscription)
        if (!session.subscription) {
          console.error('Missing subscription in session:', session.id)
          break
        }
        
        // Get subscription data directly and cast it to our simplified type
        const subscriptionResponse = await stripe.subscriptions.retrieve(session.subscription)
        const subscription = subscriptionResponse as unknown as StripeSubscription
        console.log('Subscription retrieved, updating user subscription for:', userId)
          
        const { data, error } = await supabaseService
          .from('user_subscriptions')
          .upsert({
            id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          
        if (error) {
          console.error('Error updating user after checkout:', error.message)
          throw error
        }
          
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'customer.subscription.created': {
        // Use our custom type
        const subscription = event.data.object as StripeSubscription
        console.log('Processing customer.subscription.created:', subscription.id)
        
        const userId = subscription.metadata?.userId
        if (!userId) {
          console.error('Missing userId in subscription metadata:', subscription.id)
          break
        }
        
        console.log('Updating user subscription for:', userId)
        const { data, error } = await supabaseService
          .from('user_subscriptions')
          .upsert({
            id: userId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_start_date: new Date(subscription.start_date * 1000).toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          
        if (error) {
          console.error('Error updating user on subscription created:', error.message)
          throw error
        }
        
        console.log('User subscription updated successfully:', data)
        break
      }

      case 'customer.subscription.updated': {
        // Use our custom type
        const subscription = event.data.object as StripeSubscription
        console.log('Processing customer.subscription.updated:', subscription.id)
        
        // Find the user by subscription ID
        const { data: userData, error: userError } = await supabaseService
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
        
        const { data, error } = await supabaseService
          .from('user_subscriptions')
          .update({
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
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
        // Use our custom type
        const subscription = event.data.object as StripeSubscription
        console.log('Processing customer.subscription.deleted:', subscription.id)
        
        // Find the user by subscription ID
        const { data: userData, error: userError } = await supabaseService
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
        
        const { data, error } = await supabaseService
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
        // Use our custom type instead of Stripe.Invoice
        const invoice = event.data.object as StripeInvoice
        console.log('Processing invoice.payment_succeeded:', invoice.id)
        
        // Check if the invoice has a subscription
        if (!invoice.subscription) {
          console.log('No subscription ID in invoice:', invoice.id)
          break
        }
        
        const subscriptionId = invoice.subscription
        
        const { data: userData, error: userError } = await supabaseService
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscriptionId, userError.message)
          break
        }
        
        console.log('Updating user subscription for:', userData.id, 'payment succeeded')
        
        const { data, error } = await supabaseService
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
        // Use our custom type
        const invoice = event.data.object as StripeInvoice
        console.log('Processing invoice.payment_failed:', invoice.id)
        
        // Check if the invoice has a subscription
        if (!invoice.subscription) {
          console.log('No subscription ID in invoice:', invoice.id)
          break
        }
        
        const subscriptionId = invoice.subscription
        
        const { data: userData, error: userError } = await supabaseService
          .from('user_subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
          
        if (userError) {
          console.error('User not found for subscription:', subscriptionId, userError.message)
          break
        }
        
        console.log('Updating user subscription for:', userData.id, 'payment failed')
        
        const { data, error } = await supabaseService
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