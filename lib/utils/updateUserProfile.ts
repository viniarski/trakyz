import { createClient } from '@/lib/utils/supabase/client'

export const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
  try {
    const supabase = createClient()
    
    console.log('User profile update:', { userId, updates })
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
    
    console.log('User profile update result:', data)
    return data
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}