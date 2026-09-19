import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return standard client or warning gracefully
    return createSupabaseClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createClient();
