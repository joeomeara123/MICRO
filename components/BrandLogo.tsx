import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

// Brand logo URLs - using high quality sources
const BRAND_LOGOS: Record<string, string> = {
  // Task sources
  notion: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
  gmail: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
  email: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',

  // Social/communication
  twitter: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
  x: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png',
  slack: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',

  // Publications/newsletters
  'every.to': 'https://every.to/favicon.ico',
  'financial times': 'https://www.ft.com/__origami/service/image/v2/images/raw/ftlogo-v1%3Abrand-ft-logo-square-coloured?source=update-logos&format=svg',
  'first round': 'https://assets-global.website-files.com/5f2b25e86e4c4f1c64a0c70f/5f2b2647b50c3f0d90c5e8e5_fr-favicon.png',
  'lenny': 'https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c48569f-373c-4d04-96a3-3a8f51e4e02b_256x256.png',
  'techcrunch': 'https://techcrunch.com/wp-content/uploads/2015/02/cropped-cropped-favicon-gradient.png',
  'the verge': 'https://cdn.vox-cdn.com/uploads/chorus_asset/file/7395367/favicon-64x64.0.png',

  // Default fallback handled separately
};

// Fallback icons when no logo available
const FALLBACK_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  notion: 'document-text',
  email: 'mail',
  gmail: 'mail',
  ai_suggestion: 'sparkles',
  manual: 'create',
  twitter: 'logo-twitter',
  slack: 'chatbubbles',
  newsletter: 'newspaper',
  article: 'reader',
};

interface BrandLogoProps {
  brand: string;
  size?: number;
}

export function BrandLogo({ brand, size = 24 }: BrandLogoProps) {
  const normalizedBrand = brand.toLowerCase();
  const logoUrl = BRAND_LOGOS[normalizedBrand];

  if (logoUrl) {
    return (
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 4 }]}>
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size - 4, height: size - 4 }}
          contentFit="contain"
          transition={200}
        />
      </View>
    );
  }

  // Fallback to icon
  const iconName = FALLBACK_ICONS[normalizedBrand] || 'ellipse';
  return (
    <View style={[styles.iconContainer, { width: size, height: size, borderRadius: size / 4 }]}>
      <Ionicons name={iconName} size={size - 8} color="rgba(255,255,255,0.6)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
