import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Make sure .env.local is configured.'
  );
}

// Check if running in a browser/native environment (not SSR)
const isClient = typeof window !== 'undefined' || Platform.OS !== 'web';

// No-op storage for SSR
const noopStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

/**
 * Supabase client instance.
 *
 * Note: The client is currently untyped. After applying migrations (US-006),
 * regenerate types with `supabase gen types typescript --linked > types/database.ts`
 * and add the Database generic: createClient<Database>(...)
 *
 * @see types/database.ts for manual type definitions
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isClient ? AsyncStorage : noopStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
