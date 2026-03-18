import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeroBannerProps {
  onGetStarted?: () => void;
  compact?: boolean;
}

const palette = {
  ink900: '#1a202c',
  ink700: '#374151',
  sand100: '#faf8f6',
  rose500: '#f43f5e',
  rose300: '#fb7185',
  sea400: '#06b6d4',
};

const heroStats = [
  { label: 'Active Users', value: '2M+' },
  { label: 'Daily Intros', value: '500K+' },
  { label: 'Cities Online', value: '1,200+' },
];

const screenHeight = Dimensions.get('window').height;

export function HeroBanner({ onGetStarted, compact = false }: HeroBannerProps) {
  const minHeight = compact ? 280 : Math.min(screenHeight * 0.45, 400);

  return (
    <View style={[styles.container, { minHeight }]}>
      {/* Gradient background */}
      <LinearGradient
        colors={['#1a202c', '#2d3e50', '#1a202c']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.background}
      />

      <View style={styles.contentWrapper}>
        {/* Logo - centered & prominent */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>💕</Text>
          <Text style={styles.logoText}>Amoravibe</Text>
        </View>

        {/* Hero text */}
        <View style={styles.textSection}>
          <Text style={styles.heroTitle}>A world of faces, one place to find your person</Text>
          <Text style={styles.heroSubtitle}>
            Verified connections. Real conversations. Your perfect match awaits.
          </Text>
        </View>

        {/* Stats - only show if not compact */}
        {!compact && (
          <View style={styles.statsGrid}>
            {heroStats.map((stat) => (
              <View key={stat.label} style={styles.statBox}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA Button - only show if callback provided */}
        {onGetStarted && (
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={onGetStarted}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Start Matching Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  textSection: {
    alignItems: 'center',
    gap: 8,
    marginVertical: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginVertical: 16,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: palette.rose500,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.rose500,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
    marginTop: 12,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
