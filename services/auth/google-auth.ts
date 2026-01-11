import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { supabase } from '../supabase';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Track if we've already logged (prevent spam on re-renders)
let hasLoggedOnce = false;

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  // With development build, this creates: microapp://auth/callback
  // The custom scheme is defined in app.json and built into the native app
  const redirectUri = makeRedirectUri({
    scheme: 'microapp',
    path: 'auth/callback',
  });

  // Only log once to avoid spam on re-renders
  if (!hasLoggedOnce) {
    console.log('[GoogleAuth] Platform:', Platform.OS);
    console.log('[GoogleAuth] Redirect URI:', redirectUri);
    hasLoggedOnce = true;
  }

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('[GoogleAuth] Starting Supabase OAuth flow...');

      // Use Supabase's built-in OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true, // We'll handle the browser ourselves
        },
      });

      if (error) {
        console.error('[GoogleAuth] Supabase OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('[GoogleAuth] Opening auth URL...');
        console.log('[GoogleAuth] Full URL:', data.url);

        // Open the OAuth URL in a browser
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        console.log('[GoogleAuth] Browser result type:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('[GoogleAuth] Success! Callback URL:', result.url);

          // Parse the tokens from the URL
          // Tokens can be in hash (#) or query params (?)
          const url = new URL(result.url);

          // Try hash first (fragment)
          let accessToken: string | null = null;
          let refreshToken: string | null = null;

          if (url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            accessToken = hashParams.get('access_token');
            refreshToken = hashParams.get('refresh_token');
          }

          // Try query params if not in hash
          if (!accessToken) {
            accessToken = url.searchParams.get('access_token');
            refreshToken = url.searchParams.get('refresh_token');
          }

          // Also check for authorization code flow
          const code = url.searchParams.get('code');

          if (accessToken && refreshToken) {
            console.log('[GoogleAuth] Got tokens! Setting session...');

            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error('[GoogleAuth] Session error:', sessionError);
              throw sessionError;
            }

            console.log('[GoogleAuth] Session set! User:', sessionData.user?.email);
          } else if (code) {
            console.log('[GoogleAuth] Got authorization code, exchanging...');

            // Exchange the code for a session
            const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

            if (sessionError) {
              console.error('[GoogleAuth] Code exchange error:', sessionError);
              throw sessionError;
            }

            console.log('[GoogleAuth] Session set via code! User:', sessionData.user?.email);
          } else {
            console.log('[GoogleAuth] No tokens or code found in URL');
            console.log('[GoogleAuth] URL hash:', url.hash);
            console.log('[GoogleAuth] URL search:', url.search);
          }
        } else if (result.type === 'cancel') {
          console.log('[GoogleAuth] User cancelled');
        } else if (result.type === 'dismiss') {
          console.log('[GoogleAuth] Dismissed');
        }
      }
    } catch (error) {
      console.error('[GoogleAuth] Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    request: true,
    signInWithGoogle,
    isLoading,
  };
}
