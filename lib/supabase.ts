import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

// Client-side Supabase client
export const createClientSupabase = () => {
  return createClientComponentClient<Database>()
}

// Server-side Supabase client
export const createServerSupabase = () => {
  return createServerComponentClient<Database>({ cookies })
}

// Admin Supabase client (for server-side operations)
export const createAdminSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}