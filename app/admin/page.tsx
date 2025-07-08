// app/admin/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/Header'
import AdminHeader from './components/admin-header'
import { Activity, Shield, Users } from 'lucide-react'

// Define the types we need
interface UserProfile {
  id: string;
  email?: string;
  role?: string;
  theme_preference?: string;
  created_at: string;
}

interface MarketItem {
  date: string;
  price: number;
  [key: string]: any;
}

interface MarketData {
  crypto: MarketItem[] | null;
  metals: MarketItem[] | null;
  stocks: MarketItem[] | null;
  currencies: MarketItem[] | null;
}

export default function AdminDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserProfile[]>([])
  const [marketData, setMarketData] = useState<MarketData>({
    crypto: null,
    metals: null,
    stocks: null,
    currencies: null
  })

  // Check admin access and load data
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setIsLoading(true)
        
        // Verify current user is admin
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/sign-in')
          return
        }
        
        console.log("Current user ID:", user.id)
        
        // Get user role from profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        console.log("User profile:", profile, "Error:", profileError)
        
        if (profileError || profile?.role !== 'admin') {
          console.log("Not admin, redirecting")
          router.push('/')
          return
        }
        
        // Load user data
        const { data: profiles, error: usersError } = await supabase
          .from('user_profiles')
          .select('*')
        
        if (usersError) {
          throw new Error(`Failed to load user profiles: ${usersError.message}`)
        }
        
        console.log("Loaded profiles:", profiles)
        setUserData(profiles || [])
        
        // Load market data
        try {
          const [cryptoRes, metalsRes, stocksRes, currenciesRes] = await Promise.all([
            fetch('/api/market/crypto').then(res => res.json()),
            fetch('/api/market/metals').then(res => res.json()),
            fetch('/api/market/stocks').then(res => res.json()),
            fetch('/api/market/currencies').then(res => res.json())
          ])
          
          setMarketData({
            crypto: cryptoRes.data || null,
            metals: metalsRes.data || null,
            stocks: stocksRes.data || null,
            currencies: currenciesRes.data || null
          })
        } catch (marketError) {
          console.error("Error fetching market data:", marketError)
          // Continue without market data
        }
      } catch (err) {
        console.error("Error loading admin data:", err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-secondary)]">Loading admin dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AdminHeader />
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-500">
            <h2 className="text-xl font-semibold mb-2">Error Loading Admin Dashboard</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Calculate stats
  const totalUsers = userData.length
  const adminUsers = userData.filter(u => u.role === 'admin').length
  
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminHeader />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Total Users</p>
                <p className="text-[var(--text-primary)] text-2xl font-semibold mt-1">{totalUsers}</p>
              </div>
              <div className="bg-[var(--bg-hover)] p-3 rounded-lg">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Admin Users</p>
                <p className="text-[var(--text-primary)] text-2xl font-semibold mt-1">{adminUsers}</p>
              </div>
              <div className="bg-[var(--bg-hover)] p-3 rounded-lg">
                <Shield className="h-4 w-4 text-red-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--bg-secondary)] rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--text-secondary)] text-sm">Regular Users</p>
                <p className="text-[var(--text-primary)] text-2xl font-semibold mt-1">{totalUsers - adminUsers}</p>
              </div>
              <div className="bg-[var(--bg-hover)] p-3 rounded-lg">
                <Users className="h-4 w-4 text-green-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Market Data */}
        <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[var(--accent-primary)]" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Market Status</h2>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-[var(--accent-primary)] text-white text-sm rounded-md hover:bg-[var(--accent-secondary)] transition-colors"
            >
              Refresh Data
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Crypto</span>
              <span className="text-sm text-[var(--text-primary)]">
                {marketData.crypto && marketData.crypto.length > 0 
                  ? new Date(marketData.crypto[0].date).toLocaleString() 
                  : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Metals</span>
              <span className="text-sm text-[var(--text-primary)]">
                {marketData.metals && marketData.metals.length > 0 
                  ? new Date(marketData.metals[0].date).toLocaleString() 
                  : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Stocks</span>
              <span className="text-sm text-[var(--text-primary)]">
                {marketData.stocks && marketData.stocks.length > 0 
                  ? new Date(marketData.stocks[0].date).toLocaleString() 
                  : 'No data'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Currencies</span>
              <span className="text-sm text-[var(--text-primary)]">
                {marketData.currencies && marketData.currencies.length > 0 
                  ? new Date(marketData.currencies[0].date).toLocaleString() 
                  : 'No data'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Users Table */}
        <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--bg-hover)]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Theme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {userData.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--bg-hover)]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{user.email || 'No email'}</div>
                          <div className="text-sm text-[var(--text-secondary)]">{user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {user.theme_preference || 'blue'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}