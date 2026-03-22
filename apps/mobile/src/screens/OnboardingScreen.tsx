import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { HeroBanner } from '../components/HeroBanner';
import { lovedateApi } from '../config/api';

// Local type definitions
type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'complete';
};

type OnboardingStatusResponse = {
  userId: string;
  progressPercent: number;
  steps: OnboardingStep[];
};

// Color palette (hardcoded from @lovedate/ui)
const palette = {
  ink900: '#1a202c',
  ink800: '#1f2937',
  ink700: '#374151',
  sand100: '#faf8f6',
  rose500: '#f43f5e',
  rose300: '#fb7185',
  sea400: '#06b6d4',
};

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
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Banner at the top */}
        <HeroBanner compact={true} />

        {/* Onboarding Header */}
        <View style={styles.header}>
          <Text style={styles.kicker}>Lovedate onboarding</Text>
          <Text style={styles.title}>Verifiable identities, safer matches</Text>
          <Text style={styles.body}>
            Complete three lightweight steps to unlock messaging, device trust, and transparency
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
          {steps.map((step: OnboardingStep & { order: number; tag: string }) => {
            const isActive = step.status === 'active';
            const isComplete = step.status === 'complete';
            return (
              <View
                key={step.id}
                style={[
                  styles.card,
                  isActive && styles.cardActive,
                  isComplete && styles.cardComplete,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.stepIndexBox,
                      isActive && styles.stepIndexBoxActive,
                      isComplete && styles.stepIndexBoxComplete,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepIndex,
                        isActive && styles.stepIndexActive,
                        isComplete && styles.stepIndexComplete,
                      ]}
                    >
                      {isComplete ? '✓' : String(step.order).padStart(1, '')}
                    </Text>
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{step.title}</Text>
                    <Text style={styles.cardBody}>{step.description}</Text>
                  </View>
                  <View style={styles.tags}>
                    <Text
                      style={[
                        styles.stepTag,
                        isActive && styles.stepTagActive,
                        isComplete && styles.stepTagComplete,
                      ]}
                    >
                      {step.tag}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.ctaSection}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryCta,
              pressed && { opacity: 0.9 },
            ]}
          >
            <View
              style={[styles.ctaGradient, { backgroundColor: palette.rose500 }]}
            >
              <Text style={styles.primaryCtaText}>Continue</Text>
            </View>
          </Pressable>
          <Pressable style={styles.secondaryCta}>
            <Text style={styles.secondaryCtaText}>Save & exit</Text>
          </Pressable>
        </View>
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
    paddingBottom: 24,
  },
  header: {
    gap: 10,
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 0,
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
    fontSize: 13,
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
    color: '#dc2626',
    fontWeight: '600',
  },
  list: {
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 0,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    padding: 16,
    shadowColor: palette.ink900,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  cardActive: {
    borderColor: palette.rose500,
    backgroundColor: 'rgba(244,63,94,0.05)',
    shadowOpacity: 0.15,
  },
  cardComplete: {
    borderColor: 'rgba(26,150,71,0.3)',
    backgroundColor: 'rgba(26,150,71,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepIndexBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(13,15,26,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.12)',
  },
  stepIndexBoxActive: {
    backgroundColor: palette.rose500,
    borderColor: palette.rose500,
  },
  stepIndexBoxComplete: {
    backgroundColor: 'rgba(26,150,71,0.2)',
    borderColor: '#0E6B3B',
  },
  stepIndex: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.ink900,
  },
  stepIndexActive: {
    color: '#fff',
  },
  stepIndexComplete: {
    color: '#0E6B3B',
  },
  cardContent: {
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  stepTag: {
    fontSize: 11,
    letterSpacing: 1,
    color: palette.ink700,
    textTransform: 'uppercase',
    fontWeight: '600',
    backgroundColor: 'rgba(13,15,26,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stepTagActive: {
    color: palette.rose500,
    backgroundColor: 'rgba(244,63,94,0.1)',
  },
  stepTagComplete: {
    color: '#0E6B3B',
    backgroundColor: 'rgba(26,150,71,0.1)',
  },
  cardTitle: {
    marginTop: 0,
    fontSize: 16,
    color: palette.ink900,
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 4,
    fontSize: 13,
    color: palette.ink700,
    lineHeight: 18,
  },
  ctaSection: {
    gap: 12,
    marginTop: 32,
    paddingHorizontal: 24,
  },
  primaryCta: {
    borderRadius: 24,
    overflow: 'hidden',
    minHeight: 48,
  },
  ctaGradient: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.rose500,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 5,
  },
  primaryCtaText: {
    color: palette.sand100,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  secondaryCta: {
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: palette.ink900,
  },
  secondaryCtaText: {
    textAlign: 'center',
    color: palette.ink900,
    fontWeight: '600',
    fontSize: 15,
  },
});
