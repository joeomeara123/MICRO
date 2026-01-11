import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../supabase';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Gmail scopes - requested during sign-in
const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({
    scheme: 'microapp',
    path: 'auth/callback',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: GOOGLE_SCOPES,
    redirectUri,
    extraParams: {
      access_type: 'offline', // Request refresh token
      prompt: 'consent', // Force consent to always get refresh token
    },
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();

      if (result.type === 'success') {
        const { authentication } = result;

        if (!authentication?.idToken) {
          throw new Error('No ID token received from Google');
        }

        // Sign in to Supabase with Google ID token
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: authentication.idToken,
        });

        if (error) {
          throw error;
        }

        // Store Google tokens in user metadata for later Gmail access
        if (data.user && authentication.accessToken) {
          await supabase.auth.updateUser({
            data: {
              google_access_token: authentication.accessToken,
              google_refresh_token: authentication.refreshToken,
              google_token_expires_at: authentication.expiresIn
                ? Date.now() + authentication.expiresIn * 1000
                : null,
            },
          });
        }

        return data;
      } else if (result.type === 'cancel') {
        throw new Error('Sign in was cancelled');
      } else {
        throw new Error(`Sign in failed: ${result.type}`);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return {
    request,
    response,
    signInWithGoogle,
    isLoading: !request,
  };
}
