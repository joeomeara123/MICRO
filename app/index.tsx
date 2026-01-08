import { useEffect } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  useEffect(() => {
    console.log('[Index] Redirecting to auth...');
    router.replace('/sign-in');
  }, []);

  // Show black screen briefly during redirect
  return <View style={{ flex: 1, backgroundColor: '#000' }} />;
}
