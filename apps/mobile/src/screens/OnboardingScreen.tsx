import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { colors as uiColors } from '@lovedate/ui';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import type { OnboardingStatusResponse, OnboardingStep } from '@lovedate/api';
import { lovedateApi } from '../config/api';

const palette = uiColors;
const demoUserId = process.env.EXPO_PUBLIC_DEMO_USER_ID ?? 'demo-user';

const fallbackStatus: OnboardingStatusResponse = {
  userId: demoUserId,
  progressPercent: 40,
  steps: [
    {
      id: 'identity',
      title: 'Identity proof',
      description: 'Scan government ID + liveness selfie',
      status: 'active',
    },
    {
      id: 'device',
      title: 'Device trust',
      description: 'Register trusted device + biometric fallback',
      status: 'pending',
    },
    {
      id: 'profile',
      title: 'Discovery profile',
      description: 'Orientation, pronouns, and match intent',
      status: 'pending',
    },
  ],
};

const stepMeta: Record<string, { tag: string }> = {
  identity: { tag: 'Required' },
  device: { tag: 'Security' },
  profile: { tag: 'Profile' },
};

const statusVariants: Record<OnboardingStep['status'], { backgroundColor: string; color: string }> =
  {
    pending: {
      backgroundColor: 'rgba(13,15,26,0.08)',
      color: palette.ink800,
    },
    active: {
      backgroundColor: palette.rose500,
      color: palette.sand100,
    },
    complete: {
      backgroundColor: 'rgba(26,150,71,0.15)',
      color: '#0E6B3B',
    },
  };

export function OnboardingScreen() {
  const [status, setStatus] = React.useState<OnboardingStatusResponse>(fallbackStatus);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    lovedateApi
      .fetchOnboardingStatus(demoUserId)
      .then((response: OnboardingStatusResponse) => {
        if (!mounted) return;
        setStatus(response);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load onboarding status');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const steps = status.steps.map((step: OnboardingStep, idx: number) => ({
    order: idx + 1,
    tag: stepMeta[step.id]?.tag ?? 'Step',
    ...step,
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Lovedate onboarding</Text>
          <Text style={styles.title}>Verifiable identities, safer matches</Text>
          <Text style={styles.body}>
            Complete three lightweight steps to unlock messaging, device trust, and transparency
            across the trust center.
          </Text>

          <View style={styles.progressShell}>
            <View style={[styles.progressFill, { width: `${status.progressPercent}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{status.progressPercent.toFixed(0)}% complete</Text>
          {isLoading && (
            <View style={styles.progressLoader}>
              <ActivityIndicator size="small" color={palette.ink900} />
              <Text style={styles.loaderText}>Syncing latest progress…</Text>
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.list}>
          {steps.map((step: OnboardingStep & { order: number; tag: string }) => (
            <View key={step.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.stepIndex}>{String(step.order).padStart(2, '0')}</Text>
                <View style={styles.tags}>
                  <Text style={styles.stepTag}>{step.tag}</Text>
                  <Text style={[styles.stepStatus, statusVariants[step.status]]}>
                    {step.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardBody}>{step.description}</Text>
            </View>
          ))}
        </View>

        <Pressable style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.primaryCtaText}>Continue</Text>
        </Pressable>
        <Pressable style={styles.secondaryCta}>
          <Text style={styles.secondaryCtaText}>Save & exit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.sand100,
  },
  scroll: {
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 10,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: palette.rose500,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    color: palette.ink900,
    fontWeight: '700',
  },
  body: {
    color: palette.ink700,
    fontSize: 15,
    lineHeight: 20,
  },
  progressShell: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(13,15,26,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.rose500,
  },
  progressLabel: {
    marginTop: 8,
    fontWeight: '600',
    color: palette.ink800,
  },
  progressLoader: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: palette.ink700,
  },
  errorText: {
    marginTop: 8,
    color: palette.rose600,
    fontWeight: '600',
  },
  list: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    padding: 20,
    shadowColor: palette.ink900,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  stepIndex: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.ink900,
  },
  stepTag: {
    fontSize: 12,
    letterSpacing: 1.5,
    color: palette.ink700,
    textTransform: 'uppercase',
  },
  stepStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPending: {
    backgroundColor: 'rgba(13,15,26,0.08)',
    color: palette.ink800,
  },
  statusActive: {
    backgroundColor: palette.rose500,
    color: palette.sand100,
  },
  statusComplete: {
    backgroundColor: 'rgba(26,150,71,0.15)',
    color: '#0E6B3B',
  },
  cardTitle: {
    marginTop: 12,
    fontSize: 20,
    color: palette.ink900,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 6,
    fontSize: 14,
    color: palette.ink700,
    lineHeight: 20,
  },
  primaryCta: {
    marginTop: 12,
    backgroundColor: palette.ink900,
    borderRadius: 999,
    paddingVertical: 16,
  },
  primaryCtaText: {
    color: palette.sand100,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  secondaryCta: {
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.ink900,
  },
  secondaryCtaText: {
    textAlign: 'center',
    color: palette.ink900,
    fontWeight: '600',
  },
});
