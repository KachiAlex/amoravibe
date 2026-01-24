import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors as uiColors } from '@lovedate/ui';
import type { TrustPreviewResponse } from '@lovedate/api';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { TrustCenterScreen } from './src/screens/TrustCenterScreen';
import { lovedateApi } from './src/config/api';

const palette = {
  ink900: uiColors.ink900,
  ink700: uiColors.ink700,
  sand100: uiColors.sand100,
  rose500: uiColors.rose500,
  rose300: uiColors.rose300,
  sea400: uiColors.sea400,
};

const phases = [
  {
    label: 'Orientation',
    detail: 'Preference mapping + discovery spaces',
    tag: 'Profile',
  },
  {
    label: 'Verification',
    detail: 'ID upload, selfie match, biometric opt-in',
    tag: 'Required',
  },
  {
    label: 'Device Trust',
    detail: 'Trusted devices, passkeys, auth history',
    tag: 'Security',
  },
  {
    label: 'Trust Center',
    detail: 'Moderation feed + privacy controls',
    tag: 'Transparency',
  },
];

const highlights = [
  {
    title: 'Realtime verification',
    body: 'Persona-backed flow unlocks messaging within minutes with selfie fallback.',
    badge: 'Phase 5',
  },
  {
    title: 'Transparent risk signals',
    body: 'Members can inspect risk drivers pulled from Phase 4 analytics dashboards.',
    badge: 'Trust Center',
  },
  {
    title: 'Privacy tooling',
    body: 'Data export + delete requests wire into audit service SLAs (<48h).',
    badge: 'Compliance',
  },
];

const trustStats = [
  {
    label: 'Verification pass',
    value: '92%',
  },
  {
    label: 'Moderation cool-downs',
    value: '↓ 18%',
  },
  {
    label: 'Export SLA',
    value: '< 48h',
  },
];

type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  TrustCenter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LandingScreen({ navigation }: { navigation: NavigationProp<RootStackParamList> }) {
  const [preview, setPreview] = React.useState<TrustPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(true);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    lovedateApi
      .fetchTrustPreview()
      .then((data) => {
        if (!mounted) return;
        setPreview(data);
        setPreviewError(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setPreviewError(err instanceof Error ? err.message : 'Failed to load trust preview');
      })
      .finally(() => {
        if (mounted) setIsLoadingPreview(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const heroStats = preview
    ? [
        { label: 'Verification pass', value: `${preview.stats.verificationPassRate}%` },
        { label: 'Risk health', value: preview.stats.riskHealth },
        { label: 'Export SLA', value: `< ${preview.stats.exportSlaHours}h` },
      ]
    : trustStats;

  const journeySteps = preview
    ? preview.journey.map((step) => ({
        label: step.title,
        detail: step.description,
        tag: step.tag,
      }))
    : phases;

  const highlightCards = preview ? preview.highlights : highlights;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{preview?.snapshotLabel ?? 'Phase 5 · Lovedate'}</Text>
          </View>
          <Text style={styles.heroTitle}>Trust Center in your pocket</Text>
          <Text style={styles.heroBody}>
            Onboarding, verification, and privacy controls converge in a single mobile experience.
            Built atop the analytics warehouse and moderation automation completed in Phase 4.
          </Text>
          <View style={styles.ctaRow}>
            <View style={[styles.pillButton, styles.pillSolid]}>
              <Text
                accessibilityRole="button"
                style={[styles.pillText, styles.pillTextSolid]}
                onPress={() => navigation.navigate('Onboarding')}
              >
                Start onboarding
              </Text>
            </View>
            <View style={[styles.pillButton, styles.pillOutline]}>
              <Text
                accessibilityRole="button"
                style={[styles.pillText, styles.pillTextOutline]}
                onPress={() => navigation.navigate('TrustCenter')}
              >
                View trust specs
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statRow}>
          {isLoadingPreview ? (
            <View style={[styles.statCard, styles.statCardLoading]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            heroStats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))
          )}
        </View>
        {previewError && <Text style={styles.errorText}>{previewError}</Text>}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Journey</Text>
          <Text style={styles.sectionTitle}>Four-step runway</Text>
          <View style={styles.phaseList}>
            {journeySteps.map((phase) => (
              <View key={phase.label} style={styles.phaseCard}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseTitle}>{phase.label}</Text>
                  <Text style={styles.phaseTag}>{phase.tag}</Text>
                </View>
                <Text style={styles.phaseDetail}>{phase.detail}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Highlights</Text>
          <Text style={styles.sectionTitle}>What the mobile release delivers</Text>
          {highlightCards.map((item) => (
            <View key={item.title} style={styles.highlightCard}>
              <Text style={styles.highlightBadge}>{item.badge}</Text>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightBody}>{item.body}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer theme={NavigationDefaultTheme}>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="TrustCenter" component={TrustCenterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.sand100,
  },
  scroll: {
    padding: 24,
    gap: 24,
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: palette.ink900,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,92,141,0.15)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  badgeText: {
    color: palette.rose500,
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 32,
    color: palette.ink900,
    fontWeight: '700',
    marginTop: 16,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 22,
    color: palette.ink700,
    marginTop: 12,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  pillButton: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  pillSolid: {
    backgroundColor: palette.ink900,
  },
  pillOutline: {
    borderWidth: 1,
    borderColor: palette.ink900,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pillTextSolid: {
    color: palette.sand100,
  },
  pillTextOutline: {
    color: palette.ink900,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: 'rgba(28,34,56,0.9)',
    padding: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    shadowColor: palette.ink900,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 4,
  },
  sectionLabel: {
    color: palette.ink700,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionTitle: {
    color: palette.ink900,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 16,
  },
  phaseList: {
    gap: 12,
  },
  phaseCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(240,240,235,0.8)',
    padding: 16,
  },
  phaseTitle: {
    fontSize: 16,
    color: palette.ink900,
    fontWeight: '600',
  },
  phaseDetail: {
    color: palette.ink700,
    marginTop: 6,
    fontSize: 14,
  },
  highlightCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(28,34,56,0.08)',
    padding: 18,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  highlightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.ink900,
  },
  highlightBody: {
    marginTop: 6,
    color: palette.ink700,
    fontSize: 14,
    lineHeight: 20,
  },
});
