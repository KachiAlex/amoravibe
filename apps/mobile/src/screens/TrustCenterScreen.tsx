import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { colors as uiColors } from '@lovedate/ui';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import type { TrustPreviewResponse } from '@lovedate/api';
import { lovedateApi } from '../config/api';

const palette = uiColors;

const fallbackPreview: TrustPreviewResponse = {
  snapshotLabel: 'Lovedate · Phase 5',
  stats: {
    verificationPassRate: 92,
    riskHealth: 'Stable',
    exportSlaHours: 48,
  },
  journey: [
    {
      title: 'Orientation',
      description: 'Preference mapping, discovery space selection, disclosures.',
      tag: 'Profile',
    },
    {
      title: 'Verification',
      description: 'Government ID + selfie match in 2 minutes.',
      tag: 'Required',
    },
    {
      title: 'Device trust',
      description: 'Register trusted devices + biometrics.',
      tag: 'Security',
    },
    {
      title: 'Transparency',
      description: 'Review moderation actions + analytics signals.',
      tag: 'Trust',
    },
  ],
  highlights: [
    {
      title: 'Realtime verification',
      body: 'Persona-powered flow auto-unlocks messaging once matched.',
      badge: 'Verification',
    },
    {
      title: 'Risk disclosures',
      body: 'Showcase the signals and weights driving risk scoring.',
      badge: 'Trust ML',
    },
    {
      title: 'Audit controls',
      body: 'Export + delete actions logged in the audit service.',
      badge: 'Compliance',
    },
  ],
};

export function TrustCenterScreen() {
  const [preview, setPreview] = React.useState<TrustPreviewResponse>(fallbackPreview);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    lovedateApi
      .fetchTrustPreview()
      .then((response) => {
        if (!mounted) return;
        setPreview(response);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Unable to load trust snapshot');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    {
      title: 'Verification badge',
      value: `${preview.stats.verificationPassRate}% pass`,
      body: preview.snapshotLabel,
    },
    {
      title: 'Risk health',
      value: preview.stats.riskHealth,
      body: 'Latest analytics run',
    },
    {
      title: 'Export SLA',
      value: `< ${preview.stats.exportSlaHours}h`,
      body: 'Guaranteed data export window',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Lovedate trust center</Text>
          <Text style={styles.title}>Your transparency hub</Text>
          <Text style={styles.body}>
            Review your verification history, risk signals, and request audits directly from your
            device.
          </Text>
          {isLoading && (
            <View style={styles.loaderRow}>
              <ActivityIndicator size="small" color={palette.ink900} />
              <Text style={styles.loaderText}>Pulling latest snapshot…</Text>
            </View>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <View key={card.title} style={styles.card}>
              <Text style={styles.cardLabel}>{card.title}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardBody}>{card.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlightGrid}>
            {(preview.highlights ?? []).map((highlight) => (
              <View key={highlight.title} style={styles.highlightCard}>
                <Text style={styles.highlightBadge}>{highlight.badge}</Text>
                <Text style={styles.highlightTitle}>{highlight.title}</Text>
                <Text style={styles.highlightBody}>{highlight.body}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy requests</Text>
          <View style={styles.requestRow}>
            <View>
              <Text style={styles.requestLabel}>Data export</Text>
              <Text style={styles.requestBody}>Download your activity log within 48h</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.requestCta, pressed && { opacity: 0.7 }]}>
              <Text style={styles.requestCtaText}>Request</Text>
            </Pressable>
          </View>
          <View style={styles.requestRow}>
            <View>
              <Text style={styles.requestLabel}>Delete account</Text>
              <Text style={styles.requestBody}>Submit a deletion request with audit trail</Text>
            </View>
            <Pressable style={({ pressed }) => [styles.requestCta, pressed && { opacity: 0.7 }]}>
              <Text style={styles.requestCtaText}>Request</Text>
            </Pressable>
          </View>
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
    padding: 24,
    gap: 20,
  },
  header: {
    gap: 10,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 2,
    color: palette.rose500,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.ink900,
  },
  body: {
    color: palette.ink700,
    fontSize: 15,
    lineHeight: 20,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  loaderText: {
    color: palette.ink700,
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    color: palette.rose500,
    fontWeight: '600',
  },
  cardGrid: {
    gap: 16,
  },
  card: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    shadowColor: palette.ink900,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
  },
  cardLabel: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: palette.ink700,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.ink900,
    marginTop: 8,
  },
  cardBody: {
    marginTop: 6,
    color: palette.ink700,
    fontSize: 14,
  },
  section: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.ink900,
    marginBottom: 16,
  },
  highlightGrid: {
    gap: 16,
  },
  highlightCard: {
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(13,15,26,0.08)',
    backgroundColor: 'rgba(240,240,235,0.8)',
  },
  highlightBadge: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: palette.rose500,
  },
  highlightTitle: {
    marginTop: 8,
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
  requestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13,15,26,0.1)',
  },
  requestLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: palette.ink900,
  },
  requestBody: {
    color: palette.ink700,
    fontSize: 14,
    marginTop: 4,
  },
  requestCta: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.rose500,
  },
  requestCtaText: {
    color: palette.rose500,
    fontSize: 14,
    fontWeight: '600',
  },
});
