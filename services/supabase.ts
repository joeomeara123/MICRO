import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Database } from '@/types/database';

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
 * Typed Supabase client instance.
 * Types are generated from the database schema.
 *
 * @see types/database.ts for generated type definitions
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isClient ? AsyncStorage : noopStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Re-export Database type for convenience
export type { Database };
