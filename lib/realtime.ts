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
  supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
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

const subscriptionStatus: Record<Category, string> = {
  metals: 'CLOSED',
  crypto: 'CLOSED',
  stocks: 'CLOSED',
  currencies: 'CLOSED'
}

// Back-off retry for subscriptions
function subscribeWithRetry(channel: RealtimeChannel, category: Category) {
  let retryCount = 0
  const MAX_RETRIES = 5
  const BASE_DELAY = 100

  const attemptSubscribe = () => {
    channel.subscribe((status) => {
      subscriptionStatus[category] = status;
      
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
  const channel = supabase.channel(`${category}-changes`)
  handlers[category] = [handler as ChangeHandler<unknown>] // Safe cast to unknown

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];

  channel
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: category,
      filter: `date_day=eq.${today}` // Only get realtime updates for today's data
    }, payload => {
      handlers[category]?.forEach(h => h(payload))
    })
    .on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: category,
      filter: `date_day=eq.${today}` // Only get realtime updates for today's data
    }, payload => {
      handlers[category]?.forEach(h => h(payload))
    })
    .on('postgres_changes', { 
      event: 'DELETE', 
      schema: 'public', 
      table: category,
      filter: `date_day=eq.${today}` // Only get realtime updates for today's data
    }, payload => {
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
    subscriptionStatus[category] = 'CLOSED'
    console.log(`${category} unsubscribed`)
  }
}

export function cleanupChannels() {
  (Object.keys(channels) as Category[]).forEach(category => {
    if (channels[category]) {
      channels[category]!.unsubscribe()
      delete channels[category]
      delete handlers[category]
      subscriptionStatus[category] = 'CLOSED'
      console.log(`${category} channel cleaned up`)
    }
  })
}

export function getSubscriptionStatus(category: Category): string {
  return subscriptionStatus[category];
}

// Types for database response
interface DataItem {
  date: string; // Ensure date is a string
  id?: string;
  [key: string]: any;
}

// Function to make the frontend request refresh when needed
export async function checkDataFreshness(category: Category): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from(category)
      .select('date')
      .eq('date_day', today)
      .order('date', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error(`Error checking ${category} freshness:`, error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log(`No ${category} data for today, refresh needed`);
      return true; // No data for today, refresh needed
    }
    
    // Type check the date before using it
    const dateValue = data[0]?.date;
    if (!dateValue || typeof dateValue !== 'string') {
      console.error(`Invalid date value for ${category}:`, dateValue);
      return true; // Invalid date, refresh needed
    }
    
    const latestTimestamp = new Date(dateValue);
    const now = new Date();
    const timeDiff = (now.getTime() - latestTimestamp.getTime()) / 1000; // seconds
    
    // Different freshness thresholds per category
    const thresholds: Record<Category, number> = {
      'crypto': 600, // 10 minutes
      'stocks': 3800, // ~1 hour
      'metals': 86400, // 24 hours
      'currencies': 86400 // 24 hours
    };
    
    if (timeDiff > thresholds[category]) {
      console.log(`${category} data is stale (${Math.round(timeDiff/60)} minutes old), refresh needed`);
      return true;
    }
    
    console.log(`${category} data is fresh (${Math.round(timeDiff/60)} minutes old)`);
    return false;
  } catch (err) {
    console.error(`Error checking ${category} freshness:`, err);
    return true; // On error, assume refresh is needed
  }
}