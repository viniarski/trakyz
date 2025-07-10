// app/admin/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminHeader from './components/admin-header'
import { Activity, Shield, Users, Database, Settings, AlertTriangle } from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    systemHealth: 'healthy'
  })
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats()
    }
  }, [isAdmin])

  const checkAdminAccess = async () => {
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setUser(user)
      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminStats = async () => {
    const supabase = createClient()
    
    try {
      // Fetch user stats
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_sign_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalTransactions: totalTransactions || 0,
        systemHealth: 'healthy'
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const handleManageUsers = () => {
    setActiveTab('users')
  }

  const handleSystemSettings = () => {
    setActiveTab('settings')
  }

  const handleViewLogs = () => {
    setActiveTab('logs')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="mt-2 text-[var(--text-secondary)]">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Main app header */}
      <AdminHeader />
      
      <div className="max-w-7xl mx-auto">
        {/* Admin Section with hardcoded header */}
        <div className="bg-[var(--bg-secondary)] rounded-xl mt-6 mx-4">
          
          {/* Hardcoded Header - Same styling as reusable component */}
          <div>
            {/* Header with reduced padding and standardized layout */}
            <div className="px-4 py-3 flex justify-between items-center flex-wrap gap-y-2">
              {/* Left side - Admin Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'overview'
                        ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Overview
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'users'
                        ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Users
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'settings'
                        ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Settings
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'logs'
                        ? 'bg-[var(--accent-primary-10)] text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Logs
                  </button>
                </div>
              </div>
              
              {/* Right side - Admin Summary Stats */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-8">
                  {/* Total Users */}
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Users</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Active Users */}
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Active Users</p>
                    <p className="text-lg font-bold text-green-500">
                      {stats.activeUsers.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* Total Transactions */}
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">Total Transactions</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">
                      {stats.totalTransactions.toLocaleString()}
                    </p>
                  </div>
                  
                  {/* System Health */}
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">System Health</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        stats.systemHealth === 'healthy' ? 'bg-green-500' :
                        stats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <p className={`text-lg font-bold ${
                        stats.systemHealth === 'healthy' ? 'text-green-500' :
                        stats.systemHealth === 'warning' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {stats.systemHealth.charAt(0).toUpperCase() + stats.systemHealth.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Standardized border line */}
            <div className="border-t border-gray-800/50"></div>
          </div>
          {/* End of hardcoded header */}
          
          {/* Admin Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Admin Dashboard</h2>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={handleManageUsers}
                    className="p-6 bg-[var(--bg-hover)]/50 rounded-lg border border-[var(--bg-hover)] hover:border-[var(--accent-primary)]/30 transition-colors text-left"
                  >
                    <Users className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Manage Users</h3>
                    <p className="text-[var(--text-secondary)]">View and manage user accounts</p>
                  </button>
                  
                  <button
                    onClick={handleSystemSettings}
                    className="p-6 bg-[var(--bg-hover)]/50 rounded-lg border border-[var(--bg-hover)] hover:border-[var(--accent-primary)]/30 transition-colors text-left"
                  >
                    <Settings className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">System Settings</h3>
                    <p className="text-[var(--text-secondary)]">Configure system parameters</p>
                  </button>
                  
                  <button
                    onClick={handleViewLogs}
                    className="p-6 bg-[var(--bg-hover)]/50 rounded-lg border border-[var(--bg-hover)] hover:border-[var(--accent-primary)]/30 transition-colors text-left"
                  >
                    <Activity className="h-8 w-8 text-[var(--accent-primary)] mb-4" />
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">View Logs</h3>
                    <p className="text-[var(--text-secondary)]">Monitor system activity</p>
                  </button>
                </div>

                {/* System Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Database Status</p>
                        <p className="text-2xl font-bold text-green-500">Online</p>
                      </div>
                      <Database className="h-8 w-8 text-[var(--accent-primary)]" />
                    </div>
                  </div>

                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">API Status</p>
                        <p className="text-2xl font-bold text-green-500">Active</p>
                      </div>
                      <Activity className="h-8 w-8 text-[var(--accent-primary)]" />
                    </div>
                  </div>

                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Security</p>
                        <p className="text-2xl font-bold text-green-500">Secure</p>
                      </div>
                      <Shield className="h-8 w-8 text-[var(--accent-primary)]" />
                    </div>
                  </div>

                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">Uptime</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">99.9%</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-[var(--accent-primary)]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">User Management</h2>
                  <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/80 transition-colors">
                    Add User
                  </button>
                </div>
                
                <div className="bg-[var(--bg-hover)]/30 rounded-lg p-6">
                  <p className="text-[var(--text-secondary)]">User management interface coming soon...</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <span className="text-[var(--text-primary)]">View all users</span>
                      <span className="text-[var(--text-secondary)]">Feature in development</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <span className="text-[var(--text-primary)]">Manage user roles</span>
                      <span className="text-[var(--text-secondary)]">Feature in development</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <span className="text-[var(--text-primary)]">User activity logs</span>
                      <span className="text-[var(--text-secondary)]">Feature in development</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Application Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">Maintenance Mode</span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Disabled</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">User Registration</span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">API Rate Limiting</span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Active</button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-hover)]/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Security Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">Two-Factor Auth</span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Enabled</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">Password Policy</span>
                        <button className="px-3 py-1 bg-green-500 text-white rounded text-sm">Strong</button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-primary)]">Session Timeout</span>
                        <span className="text-[var(--text-secondary)]">24 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">System Logs</h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)]/80 transition-colors">
                      Refresh
                    </button>
                    <button className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-primary)]/80 transition-colors">
                      Export Logs
                    </button>
                  </div>
                </div>
                
                <div className="bg-[var(--bg-hover)]/30 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[var(--text-primary)]">System startup completed</span>
                      </div>
                      <span className="text-[var(--text-secondary)] text-sm">2 minutes ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[var(--text-primary)]">Database backup completed</span>
                      </div>
                      <span className="text-[var(--text-secondary)] text-sm">1 hour ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-[var(--text-primary)]">High API usage detected</span>
                      </div>
                      <span className="text-[var(--text-secondary)] text-sm">3 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-hover)]/50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[var(--text-primary)]">User authentication successful</span>
                      </div>
                      <span className="text-[var(--text-secondary)] text-sm">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}