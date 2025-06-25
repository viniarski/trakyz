// app/admin/components/users-table.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Edit, Save, X } from 'lucide-react'

interface User {
  id: string
  email: string
  role: string
  plan_type: string
  last_sign_in_at?: string | null
  created_at: string
  profile?: {
    theme_preference: string
  }
}

interface UsersTableProps {
  users: User[]
  currentUser: User | null
}

export default function UsersTable({ users, currentUser }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string>('')
  const [editTheme, setEditTheme] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditClick = (user: User) => {
    setEditingUser(user.id)
    setEditRole(user.role)
    setEditTheme(user.profile?.theme_preference || 'blue')
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
  }

  const handleSaveEdit = async (userId: string) => {
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      
      // If changing own role, block the change
      if (userId === currentUser?.id && editRole !== currentUser.role) {
        alert('You cannot change your own admin role')
        return
      }
      
      // Update the user_profiles table
      await supabase
        .from('user_profiles')
        .update({
          role: editRole,
          theme_preference: editTheme,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      // Update the local state to reflect changes
      users = users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: editRole,
            profile: {
              ...user.profile,
              theme_preference: editTheme
            }
          }
        }
        return user
      })
      
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to save changes')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-xl overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Users</h2>
        <div className="text-center py-8 text-[var(--text-secondary)]">
          No users found or there was an error loading users.
        </div>
      </div>
    )
  }

  return (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Theme</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUser?.id
              const isEditing = editingUser === user.id
              
              return (
                <tr key={user.id} className="hover:bg-[var(--bg-hover)]">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{user.email}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <select 
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded px-2 py-1 text-sm"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-500/20 text-red-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.plan_type === 'pro'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {user.plan_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                    {isEditing ? (
                      <select 
                        value={editTheme}
                        onChange={(e) => setEditTheme(e.target.value)}
                        className="bg-[var(--bg-primary)] border border-[var(--accent-primary)] rounded px-2 py-1 text-sm"
                      >
                        <option value="blue">blue</option>
                        <option value="dark">dark</option>
                        <option value="light">light</option>
                      </select>
                    ) : (
                      user.profile?.theme_preference || 'blue'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSaveEdit(user.id)}
                          disabled={isSubmitting}
                          className="text-green-500 hover:text-green-400 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(user)}
                        className="text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}