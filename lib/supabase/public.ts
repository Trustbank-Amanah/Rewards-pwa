import { createClient } from '@supabase/supabase-js';

/**
 * Publieke Supabase client zonder cookies.
 * Alleen gebruiken voor data die publiek toegankelijk is (zoals merchant ads).
 * NIET gebruiken voor user-specifieke data.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}