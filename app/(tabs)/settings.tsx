import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>
                {user?.user_metadata?.full_name || 'User'}
              </Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Connected Apps Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONNECTED APPS</Text>

        <View style={styles.card}>
          <View style={styles.appRow}>
            <Ionicons name="logo-google" size={24} color="#fff" />
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Google (Gmail)</Text>
              <Text style={styles.appStatus}>Connected</Text>
            </View>
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
            </View>
          </View>

          <View style={styles.divider} />

          <Pressable style={styles.appRow}>
            <Ionicons name="document-text-outline" size={24} color="rgba(255,255,255,0.5)" />
            <View style={styles.appInfo}>
              <Text style={[styles.appName, styles.appNameDisabled]}>Notion</Text>
              <Text style={styles.appStatus}>Not connected</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.appRow}>
            <Ionicons name="chatbubbles-outline" size={24} color="rgba(255,255,255,0.5)" />
            <View style={styles.appInfo}>
              <Text style={[styles.appName, styles.appNameDisabled]}>Slack</Text>
              <Text style={styles.appStatus}>Not connected</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </Pressable>
        </View>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* Version */}
      <Text style={styles.version}>Micro v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  accountInfo: {
    marginLeft: 16,
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  accountEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  appInfo: {
    marginLeft: 16,
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  appNameDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  appStatus: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 2,
  },
  connectedBadge: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 56,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
    marginTop: 20,
  },
});
