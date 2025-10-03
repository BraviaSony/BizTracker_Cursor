'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClientSupabase = () => {
  return createClientComponentClient<Database>()
}
