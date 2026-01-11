import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import { useGoogleAuth } from '@/services/auth/google-auth';
import { AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { signInWithGoogle } = useGoogleAuth();

  // Listen for auth state changes
  useEffect(() => {
    let mounted = true;

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && isLoading) {
        console.log('[Auth] Session check timed out, proceeding as unauthenticated');
        setIsLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        if (error) {
          console.log('[Auth] getSession error:', error.message);
        }
        console.log('[Auth] Session loaded:', session ? 'authenticated' : 'no session');
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        console.log('[Auth] getSession failed:', err);
        setIsLoading(false);
      });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      console.log('[Auth] Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      // Clear Google tokens from user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: {
            google_access_token: null,
            google_refresh_token: null,
            google_token_expires_at: null,
          },
        });
      }

      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
