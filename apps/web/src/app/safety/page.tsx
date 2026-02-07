"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Badge, Card, PillButton } from "@/lib/ui-components";
import Link from "next/link";
import {
  FileText,
  Shield,
  AlertTriangle,
  ArrowRight,
  Plus,
  Users,
  MapPin,
  Lock,
  RefreshCcw,
  Camera,
} from "lucide-react";
import { COMMUNITY_GUIDELINES } from "@/data/community-guidelines";

interface SafetyExperience {
  activeReports: number;
  activeModeration: number;
  trustScore: number;
  discoverySignal: "positive" | "neutral" | "restricted";
}

interface BlockedUser {
  id: string;
  displayName: string;
  reason?: string;
  blockedAt: string;
}

interface SafetyReport {
  id: string;
  reason: string;
  status: "submitted" | "under_review" | "action_taken";
  description?: string;
  evidence?: string;
  createdAt: string;
}

interface ModerationOutcome {
  id: string;
  action: "warning" | "content_removed" | "restricted" | "banned";
  reason: string;
  createdAt: string;
  severity: number;
}

interface EmergencyContactDraft {
  name: string;
  phone: string;
  relationship: string;
}

interface SafetyToolsState {
  emergencyContact?: EmergencyContactDraft;
  emergencyContactUpdatedAt?: string;
  locationSharingEnabled: boolean;
  locationSharingUpdatedAt?: string;
}

const REPORT_REASON_OPTIONS = [
  "harassment",
  "hate_speech",
  "impersonation",
  "orientation_violation",
  "explicit_content",
  "other",
];

const REPORT_STATUS_LABELS: Record<SafetyReport["status"], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  action_taken: "Action taken",
};

export default function SafetyPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [experience, setExperience] = useState<SafetyExperience | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [moderationOutcomes, setModerationOutcomes] = useState<ModerationOutcome[]>([]);
  const [tools, setTools] = useState<SafetyToolsState | null>(null);
  const [emergencyDraft, setEmergencyDraft] = useState<EmergencyContactDraft>({
    name: "",
    phone: "",
    relationship: "",
  });
  const [reportForm, setReportForm] = useState({
    reason: REPORT_REASON_OPTIONS[0],
    description: "",
    evidence: "",
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [savingEmergencyContact, setSavingEmergencyContact] = useState(false);
  const [updatingLocation, setUpdatingLocation] = useState(false);

  useEffect(() => {
    const resolveSession = async () => {
      try {
        const res = await fetch("/api/session");
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId ?? null);
        }
      } catch (error) {
        console.error("Failed to resolve session", error);
      }
    };
    resolveSession();
  }, []);

  const loadSafetyState = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [experienceRes, blockedRes, reportsRes, outcomesRes, toolsRes] = await Promise.all([
        fetch(`/api/dashboard/safety?action=experience&userId=${userId}`),
        fetch(`/api/dashboard/safety?action=blocked-users&userId=${userId}`),
        fetch(`/api/dashboard/safety?action=reports&userId=${userId}`),
        fetch(`/api/dashboard/safety?action=moderation-outcomes&userId=${userId}`),
        fetch(`/api/dashboard/safety?action=tools&userId=${userId}`),
      ]);

      if (experienceRes.ok) {
        const data = await experienceRes.json();
        setExperience(data.experience ?? data.data ?? null);
      }
      if (blockedRes.ok) {
        const data = await blockedRes.json();
        setBlockedUsers(data.blockedUsers ?? data.data ?? []);
      }
      if (reportsRes.ok) {
        const data = await reportsRes.json();
        setReports(data.reports ?? data.data ?? []);
      }
      if (outcomesRes.ok) {
        const data = await outcomesRes.json();
        setModerationOutcomes(data.outcomes ?? data.data ?? []);
      }
      if (toolsRes.ok) {
        const data = await toolsRes.json();
        setTools({
          emergencyContact: data.tools?.emergencyContact,
          emergencyContactUpdatedAt: data.tools?.emergencyContactUpdatedAt,
          locationSharingEnabled: data.tools?.locationSharingEnabled ?? false,
          locationSharingUpdatedAt: data.tools?.locationSharingUpdatedAt,
        });
      }
    } catch (error) {
      console.error("Failed to fetch safety state", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    loadSafetyState();
  }, [userId, loadSafetyState]);

  useEffect(() => {
    if (!tools?.emergencyContact) return;
    setEmergencyDraft(
      tools.emergencyContact ?? {
        name: "",
        phone: "",
        relationship: "",
      }
    );
  }, [tools]);

  const handleSaveEmergencyContact = async () => {
    if (!userId) return;
    if (!emergencyDraft.name.trim() || !emergencyDraft.phone.trim()) return;
    try {
      setSavingEmergencyContact(true);
      await fetch(`/api/dashboard/safety?action=emergency-contact&userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: { ...emergencyDraft },
        }),
      });
      await loadSafetyState();
    } catch (error) {
      console.error("Failed to save emergency contact", error);
    } finally {
      setSavingEmergencyContact(false);
    }
  };

  const handleToggleLocationSharing = async () => {
    if (!userId || !tools) return;
    try {
      setUpdatingLocation(true);
      await fetch(`/api/dashboard/safety?action=location-sharing&userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !tools.locationSharingEnabled }),
      });
      await loadSafetyState();
    } catch (error) {
      console.error("Failed to toggle location sharing", error);
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!userId) return;
    if (!reportForm.description.trim()) return;
    try {
      await fetch(`/api/dashboard/safety?action=report&userId=${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });
      setShowReportModal(false);
      setReportForm({ reason: REPORT_REASON_OPTIONS[0], description: "", evidence: "" });
      await loadSafetyState();
    } catch (error) {
      console.error("Failed to submit report", error);
    }
  };

  const renderGuidelines = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {COMMUNITY_GUIDELINES.map((rule) => (
        <Card key={rule.id} className="space-y-2 rounded-2xl border border-ink-100 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-ink-900">{rule.title}</p>
            <Badge tone="secondary" className="text-xs uppercase">
              {rule.severity}
            </Badge>
          </div>
          <p className="text-sm text-ink-600">{rule.detail}</p>
          {rule.signal && <p className="text-xs text-ink-500">Signal: {rule.signal}</p>}
        </Card>
      ))}
    </div>
  );

  const experienceStatus = useMemo(() => {
    if (!experience) return null;
    return (
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active reports</p>
          <p className="text-2xl font-semibold text-ink-900">{experience.activeReports}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Moderation queues</p>
          <p className="text-2xl font-semibold text-ink-900">{experience.activeModeration}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Trust signal</p>
          <p className="text-2xl font-semibold text-ink-900">{experience.trustScore}</p>
        </Card>
      </div>
    );
  }, [experience]);

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit bg-red-500/10 text-red-500">
            Safety Center
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Access Safety Tools</h1>
          <p className="text-ink-700">Please sign in to manage reports, blocked users, and safety signals.</p>
          <Link className="text-red-600 underline" href="/onboarding">
            Finish onboarding →
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[36px] border border-white/40 bg-white/90 p-8 shadow-[0_30px_100px_rgba(13,15,26,0.12)] backdrop-blur">
        <div>
          <Badge tone="primary" className="mb-4 bg-red-500/10 text-red-500">
            Safety Center
          </Badge>
          <h1 className="font-display text-4xl text-ink-900">Trustworthy, proactive safety</h1>
          <p className="mt-2 max-w-2xl text-lg text-ink-700">
            Report behavior, manage your safety tools, and watch how enforcement works in real time.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6">
        {loading ? (
          <p className="text-center text-ink-600">Loading safety data…</p>
        ) : (
          <>
            {experienceStatus}

            <Card className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Reporting system</p>
                  <h2 className="text-xl font-semibold text-ink-900">Track your submissions</h2>
                </div>
                <PillButton onClick={() => setShowReportModal(true)}>
                  <Plus className="h-4 w-4" /> File report
                </PillButton>
              </div>
              <div className="grid gap-4">
                {reports.length === 0 ? (
                  <p className="text-sm text-ink-500">No recent reports. Nothing to track yet.</p>
                ) : (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="rounded-2xl border border-ink-100 bg-white/70 p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900 capitalize">{report.reason.replace("_", " ")}</p>
                          <p className="text-xs text-ink-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Badge tone="secondary" className="capitalize">
                          {REPORT_STATUS_LABELS[report.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-700 mt-2">{report.description}</p>
                      {report.evidence && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-ink-500">
                          <Camera className="h-4 w-4" /> Evidence attached
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Badge tone="primary" className="text-xs uppercase tracking-[0.3em] bg-slate-100 text-slate-500">
                    Safety tools
                  </Badge>
                  <h2 className="text-xl font-semibold text-ink-900">Emergency contact & location</h2>
                </div>
                <PillButton onClick={handleToggleLocationSharing} disabled={updatingLocation}>
                  {updatingLocation ? "Updating…" : tools?.locationSharingEnabled ? "Pause" : "Share"}
                </PillButton>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm text-ink-600">Emergency contact (optional)</p>
                  <div className="grid gap-2">
                    <input
                      value={emergencyDraft.name}
                      onChange={(event) =>
                        setEmergencyDraft((prev) => ({ ...prev, name: event.target.value }))
                      }
                      placeholder="Name"
                      className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      value={emergencyDraft.phone}
                      onChange={(event) =>
                        setEmergencyDraft((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="Phone"
                      className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      value={emergencyDraft.relationship}
                      onChange={(event) =>
                        setEmergencyDraft((prev) => ({ ...prev, relationship: event.target.value }))
                      }
                      placeholder="Relationship (optional)"
                      className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <PillButton onClick={handleSaveEmergencyContact} disabled={savingEmergencyContact}>
                    {savingEmergencyContact ? "Saving…" : "Save contact"}
                  </PillButton>
                  {tools?.emergencyContactUpdatedAt && (
                    <p className="text-xs text-ink-500">
                      Updated {new Date(tools.emergencyContactUpdatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-ink-900">Location sharing</p>
                      <p className="text-xs text-ink-500">Visible to the safety crew during escalations.</p>
                    </div>
                    <Badge tone={tools?.locationSharingEnabled ? "success" : "secondary"}>
                      {tools?.locationSharingEnabled ? "Active" : "Off"}
                    </Badge>
                  </div>
                  {tools?.locationSharingUpdatedAt && (
                    <p className="text-xs text-ink-500 mt-2">
                      Updated {new Date(tools.locationSharingUpdatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Community Guidelines</p>
                  <h2 className="text-xl font-semibold text-ink-900">Rules that evolve with the platform</h2>
                </div>
                <Badge tone="primary">Dynamic</Badge>
              </div>
              {renderGuidelines()}
            </Card>

            <Card className="space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Moderation outcomes</p>
                  <h2 className="text-xl font-semibold text-ink-900">Documented actions</h2>
                </div>
                <ArrowRight className="h-4 w-4 text-ink-500" />
              </div>
              {moderationOutcomes.length === 0 ? (
                <p className="text-sm text-ink-500">No actions recorded yet.</p>
              ) : (
                moderationOutcomes.map((outcome) => (
                  <div key={outcome.id} className="rounded-2xl border border-ink-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-ink-900 capitalize">{outcome.action.replace("_", " ")}</p>
                      <span className="text-xs text-ink-500">Severity {outcome.severity}</span>
                    </div>
                    <p className="text-sm text-ink-600 mt-1">{outcome.reason}</p>
                    <p className="text-xs text-ink-500 mt-2">{new Date(outcome.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </Card>

            <Card className="space-y-6 p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-red-500" />
                <div>
                  <p className="text-base font-semibold text-ink-900">Structured escalation</p>
                  <p className="text-sm text-ink-500">
                    Repeat offenses escalate automatically and can trigger temporary restrictions or bans. Severe reports flag orientation misuse instantly and impact community visibility.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {["Repeat offenses", "Severe reports", "Orientation misuse", "Discovery signals"].map((signal) => (
                  <div key={signal} className="rounded-2xl border border-dashed border-ink-200 p-4 text-sm text-ink-600">
                    <p className="font-semibold text-ink-900">{signal}</p>
                    <p className="text-xs text-ink-500">Automated rules apply here.</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </section>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-lg space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink-900">File a report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-ink-500 hover:text-ink-900">
                Close
              </button>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Reason</label>
              <select
                value={reportForm.reason}
                onChange={(event) => setReportForm((prev) => ({ ...prev, reason: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {REPORT_REASON_OPTIONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Description</label>
              <textarea
                rows={4}
                value={reportForm.description}
                onChange={(event) => setReportForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Describe what happened..."
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Evidence (optional)</label>
              <input
                value={reportForm.evidence}
                onChange={(event) => setReportForm((prev) => ({ ...prev, evidence: event.target.value }))}
                placeholder="Link to screenshot or message"
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <PillButton onClick={() => setShowReportModal(false)} className="flex-1 bg-ink-100 text-ink-700">
                Cancel
              </PillButton>
              <PillButton onClick={handleSubmitReport} className="flex-1">
                Submit report
              </PillButton>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}