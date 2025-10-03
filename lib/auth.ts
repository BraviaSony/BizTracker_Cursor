import { createClientSupabase } from './supabase-client'
import { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  company_name?: string
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const supabase = createClientSupabase()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      full_name: profile?.full_name || user.user_metadata?.full_name,
      company_name: profile?.company_name || user.user_metadata?.company_name,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export const createUserProfile = async (user: User) => {
  try {
    const supabase = createClientSupabase()
    
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
        company_name: user.user_metadata?.company_name,
      })

    if (error) {
      console.error('Error creating user profile:', error)
    }
  } catch (error) {
    console.error('Error creating user profile:', error)
  }
}

export const updateUserProfile = async (updates: Partial<AuthUser>) => {
  try {
    const supabase = createClientSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}
