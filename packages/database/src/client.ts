import { createClient as createSupabaseClient, SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

export type SupabaseClient = BaseSupabaseClient<Database>;

/**
 * Create a typed Supabase client
 *
 * Usage:
 * ```ts
 * import { createClient } from '@rota/database';
 *
 * const supabase = createClient(
 *   process.env.SUPABASE_URL!,
 *   process.env.SUPABASE_ANON_KEY!
 * );
 * ```
 */
export function createClient(supabaseUrl: string, supabaseKey: string) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a Supabase client for React Native (mobile)
 * Uses AsyncStorage for session persistence
 */
export function createMobileClient(
  supabaseUrl: string,
  supabaseKey: string,
  storage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  }
) {
  return createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: {
        getItem: storage.getItem,
        setItem: storage.setItem,
        removeItem: storage.removeItem,
      },
    },
  });
}
