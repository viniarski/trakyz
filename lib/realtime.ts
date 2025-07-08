// lib/realtime.ts

import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
}

let supabase: ReturnType<typeof createClient>;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(`Failed to initialize Supabase client: ${errorMessage}`);
}

// Define supported categories as a union type
type Category = 'metals' | 'crypto' | 'stocks' | 'currencies'

// Define the handler type based on Supabase payload
type ChangeHandler<T = unknown> = (payload: RealtimePostgresChangesPayload<{
  [key: string]: T
}>) => void

// Generic type for handlers to avoid 'any'
type HandlerList = ChangeHandler<unknown>[];

// Initialize channels and handlers
const channels: Record<Category, RealtimeChannel | undefined> = {
  metals: undefined,
  crypto: undefined,
  stocks: undefined,
  currencies: undefined
}

const handlers: Record<Category, HandlerList | undefined> = {
  metals: undefined,
  crypto: undefined,
  stocks: undefined,
  currencies: undefined
}

const pendingChannels: Record<Category, boolean> = {
  metals: false,
  crypto: false,
  stocks: false,
  currencies: false
}

function subscribeWithRetry(channel: RealtimeChannel, category: Category) {
  let retryCount = 0
  const MAX_RETRIES = 5
  const BASE_DELAY = 100

  const attemptSubscribe = () => {
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`${category} successfully subscribed`)
        retryCount = 0
        pendingChannels[category] = false
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        if (retryCount < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, retryCount)
          console.log(`${category} retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`)
          retryCount++
          setTimeout(attemptSubscribe, delay)
        } else {
          console.error(`${category} subscription failed after ${MAX_RETRIES} attempts`)
          channel.unsubscribe()
          pendingChannels[category] = false
        }
      } else {
        console.log(`${category} subscription status: ${status}`)
      }
    })
  }
  attemptSubscribe()
}

export function registerHandler<T>(category: Category, handler: ChangeHandler<T>) {
  if (pendingChannels[category]) {
    handlers[category] = handlers[category] ?? []
    handlers[category]!.push(handler as ChangeHandler<unknown>) // Safe cast to unknown
    return
  }

  if (channels[category]) {
    handlers[category] = handlers[category] ?? []
    handlers[category]!.push(handler as ChangeHandler<unknown>) // Safe cast to unknown
    return
  }

  pendingChannels[category] = true
  const channel = supabase.channel(category)
  handlers[category] = [handler as ChangeHandler<unknown>] // Safe cast to unknown

  channel
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: category }, payload => {
      handlers[category]?.forEach(h => h(payload))
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: category }, payload => {
      handlers[category]?.forEach(h => h(payload))
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: category }, payload => {
      handlers[category]?.forEach(h => h(payload))
    })

  subscribeWithRetry(channel, category)
  channels[category] = channel
}

export function unregisterHandler<T>(category: Category, handler: ChangeHandler<T>) {
  if (!handlers[category] || !channels[category]) {
    console.log(`${category} not subscribed, nothing to unregister`)
    return
  }

  handlers[category] = handlers[category]!.filter(h => h !== (handler as ChangeHandler<unknown>))
  if (handlers[category]!.length === 0) {
    channels[category]!.unsubscribe()
    delete channels[category]
    delete handlers[category]
    console.log(`${category} unsubscribed`)
  }
}

export function cleanupChannels() {
  (Object.keys(channels) as Category[]).forEach(category => {
    if (channels[category]) {
      channels[category]!.unsubscribe()
      delete channels[category]
      delete handlers[category]
      console.log(`${category} channel cleaned up`)
    }
  })
}

export function getSubscriptionStatus(category: Category): string {
  return channels[category]?.state ?? 'CLOSED'
}