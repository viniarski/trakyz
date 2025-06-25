// app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`[${requestId}] Webhook request received:`, {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method
  })
  
  try {
    // Get the raw body
    const body = await request.text()
    console.log(`[${requestId}] Body received, length:`, body.length)

    // Get headers
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    const userAgent = headersList.get('user-agent')
    
    console.log(`[${requestId}] Headers:`, {
      signature: signature ? 'present' : 'missing',
      userAgent,
      contentType: headersList.get('content-type')
    })

    // Validate signature exists
    if (!signature) {
      console.error(`[${requestId}] Missing Stripe-Signature header`)
      return NextResponse.json(
        { error: 'Missing signature', requestId }, 
        { status: 400 }
      )
    }

    // Validate webhook secret exists
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error(`[${requestId}] Missing STRIPE_WEBHOOK_SECRET in environment`)
      return NextResponse.json(
        { error: 'Webhook secret not configured', requestId }, 
        { status: 500 }
      )
    }

    // Construct and verify the event
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body, 
        signature, 
        process.env.STRIPE_WEBHOOK_SECRET
      )
      console.log(`[${requestId}] Event verified:`, {
        type: event.type,
        id: event.id,
        apiVersion: event.api_version,
        created: new Date(event.created * 1000).toISOString()
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown verification error'
      console.error(`[${requestId}] Webhook signature verification failed:`, {
        error: errorMessage,
        hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        bodyLength: body.length
      })
      return NextResponse.json(
        { error: 'Webhook signature verification failed', requestId }, 
        { status: 400 }
      )
    }

    // Process the event
    await processWebhookEvent(event, requestId)
    
    const processingTime = Date.now() - startTime
    console.log(`[${requestId}] Webhook processed successfully in ${processingTime}ms`)
    
    return NextResponse.json({ 
      received: true, 
      requestId,
      eventType: event.type,
      processingTime 
    }, { status: 200 })
    
  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error(`[${requestId}] Webhook handler error after ${processingTime}ms:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })
    
    // Always return 200 for non-verification errors to prevent retries
    // Stripe will retry failed webhooks, but we want to log and move on
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      message: errorMessage,
      requestId 
    }, { status: 500 })
  }
}

async function processWebhookEvent(event: Stripe.Event, requestId: string) {
  console.log(`[${requestId}] Processing event: ${event.type}`)
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, requestId)
        break
      }

      case 'customer.subscription.created': {
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription, requestId)
        break
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, requestId)
        break
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, requestId)
        break
      }

      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, requestId)
        break
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, requestId)
        break
      }

      case 'checkout.session.expired': {
        console.log(`[${requestId}] Checkout session expired: ${(event.data.object as Stripe.Checkout.Session).id}`)
        // No action needed, just log for tracking
        break
      }

      default:
        console.log(`[${requestId}] Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`[${requestId}] Error processing ${event.type}:`, error)
    throw error
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, requestId: string) {
  console.log(`[${requestId}] Processing checkout.session.completed: ${session.id}`)
  
  if (session.mode !== 'subscription') {
    console.log(`[${requestId}] Not a subscription checkout, skipping: ${session.mode}`)
    return
  }

  const userId = session.metadata?.userId
  const planType = session.metadata?.planType
  
  console.log(`[${requestId}] Checkout metadata:`, { userId, planType })
  
  if (!userId || !planType) {
    console.error(`[${requestId}] Missing metadata in checkout session: ${session.id}`)
    return
  }
  
  if (!session.subscription) {
    console.error(`[${requestId}] Missing subscription ID in session: ${session.id}`)
    return
  }
  
  // Get subscription details
  const subscriptionId = typeof session.subscription === 'string' 
    ? session.subscription 
    : session.subscription.id
    
  console.log(`[${requestId}] Fetching subscription details: ${subscriptionId}`)
  
  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId)
  
  console.log(`[${requestId}] Updating user: ${userId} to plan: ${planType}`)
  
  // Access the subscription data from the response and cast to include current_period_end
  const subscription = subscriptionResponse as unknown as Stripe.Subscription & {
    current_period_end: number
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
  
  if (error) {
    console.error(`[${requestId}] Error updating user after checkout:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User updated successfully:`, data)
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription, requestId: string) {
  console.log(`[${requestId}] Processing customer.subscription.created: ${subscription.id}`)
  
  const userId = subscription.metadata?.userId
  if (!userId) {
    console.error(`[${requestId}] Missing userId in subscription metadata: ${subscription.id}`)
    return
  }
  
  console.log(`[${requestId}] Updating user: ${userId} subscription created`)
  
  // Cast subscription to include current_period_end
  const subscriptionWithPeriod = subscription as unknown as Stripe.Subscription & {
    current_period_end: number
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_start_date: new Date(subscription.start_date * 1000).toISOString(),
      subscription_end_date: new Date(subscriptionWithPeriod.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    
  if (error) {
    console.error(`[${requestId}] Error updating user on subscription created:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User updated successfully:`, data)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription, requestId: string) {
  console.log(`[${requestId}] Processing customer.subscription.updated: ${subscription.id}`)
  
  // Find user by subscription ID
  const { data: userData, error: userError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()
    
  if (userError) {
    console.error(`[${requestId}] User not found for subscription: ${subscription.id}`, userError.message)
    return
  }
  
  const userId = userData.id
  console.log(`[${requestId}] Updating user subscription: ${userId}`)
  
  // Cast subscription to include current_period_end
  const subscriptionWithPeriod = subscription as unknown as Stripe.Subscription & {
    current_period_end: number
  }
  
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      subscription_status: subscription.status,
      subscription_end_date: new Date(subscriptionWithPeriod.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    
  if (error) {
    console.error(`[${requestId}] Error updating user on subscription updated:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User subscription updated successfully:`, data)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, requestId: string) {
  console.log(`[${requestId}] Processing customer.subscription.deleted: ${subscription.id}`)
  
  // Find user by subscription ID
  const { data: userData, error: userError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single()
    
  if (userError) {
    console.error(`[${requestId}] User not found for subscription: ${subscription.id}`, userError.message)
    return
  }
  
  const userId = userData.id
  console.log(`[${requestId}] Updating user subscription for cancellation: ${userId}`)
  
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
    console.error(`[${requestId}] Error updating user on subscription deleted:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User subscription updated successfully:`, data)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, requestId: string) {
  console.log(`[${requestId}] Processing invoice.payment_succeeded: ${invoice.id}`)
  
  // Type assertion to handle the subscription property that TypeScript doesn't recognize
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
  }
  
  if (!invoiceWithSubscription.subscription) {
    console.log(`[${requestId}] No subscription ID in invoice: ${invoice.id}`)
    return
  }
  
  const subscriptionId = typeof invoiceWithSubscription.subscription === 'string' 
    ? invoiceWithSubscription.subscription 
    : invoiceWithSubscription.subscription.id
  
  // Find user by subscription ID
  const { data: userData, error: userError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()
    
  if (userError) {
    console.error(`[${requestId}] User not found for subscription: ${subscriptionId}`, userError.message)
    return
  }
  
  console.log(`[${requestId}] Updating user subscription for payment success: ${userData.id}`)
  
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userData.id)
    .select()
    
  if (error) {
    console.error(`[${requestId}] Error updating user on payment success:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User subscription updated successfully:`, data)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, requestId: string) {
  console.log(`[${requestId}] Processing invoice.payment_failed: ${invoice.id}`)
  
  // Type assertion to handle the subscription property that TypeScript doesn't recognize
  const invoiceWithSubscription = invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null
  }
  
  if (!invoiceWithSubscription.subscription) {
    console.log(`[${requestId}] No subscription ID in invoice: ${invoice.id}`)
    return
  }
  
  const subscriptionId = typeof invoiceWithSubscription.subscription === 'string' 
    ? invoiceWithSubscription.subscription 
    : invoiceWithSubscription.subscription.id
  
  // Find user by subscription ID
  const { data: userData, error: userError } = await supabaseAdmin
    .from('user_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single()
    
  if (userError) {
    console.error(`[${requestId}] User not found for subscription: ${subscriptionId}`, userError.message)
    return
  }
  
  console.log(`[${requestId}] Updating user subscription for payment failure: ${userData.id}`)
  
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userData.id)
    .select()
    
  if (error) {
    console.error(`[${requestId}] Error updating user on payment failed:`, error.message)
    throw error
  }
  
  console.log(`[${requestId}] User subscription updated successfully:`, data)
}