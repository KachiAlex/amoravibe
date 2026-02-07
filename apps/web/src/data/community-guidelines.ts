export type GuidelineSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface CommunityGuideline {
  id: string;
  title: string;
  detail: string;
  severity: GuidelineSeverity;
  signal?: string;
}

export const COMMUNITY_GUIDELINES: CommunityGuideline[] = [
  {
    id: 'impersonation',
    title: 'Impersonation',
    detail: 'Do not pretend to be another person, brand, or ﬁgure of authority. Authentic identity keeps every space safe.',
    severity: 'critical',
    signal: 'Flagged within minutes, auto-escalation for repeat attempts',
  },
  {
    id: 'harassment',
    title: 'Harassment',
    detail: 'Threats, stalking, or repeated unwanted outreach is not tolerated. Reports route to a dedicated safety analyst.',
    severity: 'high',
    signal: 'Strike-based notifications encourage cooling-off periods',
  },
  {
    id: 'hate_speech',
    title: 'Hate speech',
    detail: 'Bigotry, slurs, or targeted exclusion based on protected characteristics are removed immediately.',
    severity: 'critical',
    signal: 'Orientation misuse, slurs, or imagery receive instant restrictions',
  },
  {
    id: 'orientation_integrity',
    title: 'Orientation integrity',
    detail: 'Misrepresenting sexual orientation or using false identity to access protected communities is penalized.',
    severity: 'high',
    signal: 'Orientation changes logged and reviewed before discovery updates',
  },
  {
    id: 'consent',
    title: 'Consent & boundaries',
    detail: 'Respect boundaries after a decline. Repeated boundary violations raise the trust signal and limit discovery visibility.',
    severity: 'medium',
    signal: 'Community visibility reduced after two violations',
  },
];
