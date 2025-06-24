import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export function createSupabaseClient() {
  return createClient(supabaseUrl as string, supabaseAnonKey as string)
}

// Singleton for client-side use
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string) 