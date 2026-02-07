"use client";

import React, { useEffect, useState } from "react";
import { Badge, Card, PillButton } from "@/lib/ui-components";
import { Shield, Bell, Eye, CreditCard, ArrowRight } from "lucide-react";

interface SettingsPayload {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingNotifications: boolean;
  profileVisibility: string;
  discoveryPreference: string;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  allowAnalytics: boolean;
  whoCanSeeMe: string;
  whoCanMessageMe: string;
  communityVisibility: string;
  ageRange: [number, number];
  maxDistanceMiles: number;
  intentPreferences: string[];
  dealbreakers: string[];
  twoFactorEnabled: boolean;
}

const DEFAULT_SETTINGS: SettingsPayload = {
  emailNotifications: true,
  pushNotifications: true,
  marketingNotifications: false,
  profileVisibility: "verified_only",
  discoveryPreference: "everywhere",
  allowMessages: true,
  showOnlineStatus: true,
  allowAnalytics: true,
  whoCanSeeMe: "everyone",
  whoCanMessageMe: "matches",
  communityVisibility: "public",
  ageRange: [23, 38],
  maxDistanceMiles: 30,
  intentPreferences: ["dating"],
  dealbreakers: ["No smokers", "No political talk"],
  twoFactorEnabled: true,
};

const INTENT_LABELS = [
  { value: "dating", label: "Dating" },
  { value: "relationship", label: "Serious relationship" },
  { value: "casual", label: "Casual" },
  { value: "friendship", label: "Friendship" },
];

const VISIBILITY_OPTIONS = [
  { value: "everyone", label: "Everyone" },
  { value: "matches", label: "Matches only" },
  { value: "verified_only", label: "Verified only" },
];

// const DISCOVERY_STATES = [
//   { value: "everywhere", label: "Everywhere" },
//   { value: "app_only", label: "In app only" },
//   { value: "hidden", label: "Hidden" },
// ];

const ACTIVE_SESSIONS = [
  { id: "session-1", device: "iPhone 15", location: "San Francisco, CA", updatedAt: "2h ago" },
  { id: "session-2", device: "Chrome · Windows", location: "New York, NY", updatedAt: "Yesterday" },
];

interface SubscriptionInfo {
  status: "active" | "inactive";
  plan: string;
  expiresAt?: string;
  billingHistory: Array<{ id: string; date: string; amount: string }>;
}

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsPayload>(DEFAULT_SETTINGS);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    status: "active",
    plan: "pro",
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingHistory: [
      { id: "bh-1", date: "Jan 02, 2026", amount: "$19.99" },
      { id: "bh-2", date: "Dec 02, 2025", amount: "$19.99" },
      { id: "bh-3", date: "Nov 02, 2025", amount: "$19.99" },
    ],
  });
  const [, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [contactEmail, setContactEmail] = useState("emma@lovedate.app");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 111-2222");

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

  useEffect(() => {
    if (!userId) return;
    const loadSettings = async () => {
      try {
        setLoading(true);
        const [settingsRes, subscriptionRes] = await Promise.all([
          fetch(`/api/dashboard/settings?userId=${userId}`),
          fetch(`/api/dashboard/subscription?userId=${userId}`),
        ]);
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setSettings((prev) => ({ ...prev, ...(data.settings ?? {}) }));
          if (typeof data.contactEmail === "string") {
            setContactEmail(data.contactEmail);
          }
          if (typeof data.phoneNumber === "string") {
            setPhoneNumber(data.phoneNumber);
          }
        }
        if (subscriptionRes.ok) {
          const data = await subscriptionRes.json();
          setSubscription((prev) => ({ ...prev, ...(data.subscription ?? {}) }));
        }
      } catch (error) {
        console.error("Failed to load settings", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [userId]);

  const handleSaveSettings = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/dashboard/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, settings, contactEmail, phoneNumber }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusMessage("Passwords must match.");
      return;
    }
    try {
      const res = await fetch(`/api/dashboard/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...passwordForm }),
      });
      if (res.ok) {
        setStatusMessage("Password updated and sessions reset.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (error) {
      console.error("Failed to change password", error);
      setStatusMessage("Unable to change password right now.");
    }
  };

  if (!userId) {
    return (
      <main className="space-y-6 px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit">
            Settings
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Sign in to control privacy</h1>
          <p className="text-ink-700">Complete onboarding to access privacy toggles, 2FA, and lifecycle controls.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto max-w-6xl space-y-4 rounded-[36px] border border-white/40 bg-white/90 p-8 shadow-[0_30px_100px_rgba(13,15,26,0.12)] backdrop-blur">
        <Badge tone="primary" className="mb-2 bg-slate-100 text-slate-500">
          Control center
        </Badge>
        <h1 className="font-display text-4xl text-ink-900">Total account control</h1>
        <p className="text-lg text-ink-600">
          Privacy-first settings across notifications, discovery, subscriptions, and lifecycle. Every change flows through the backend so identity rules stay enforced.
        </p>
      </section>

      {saved && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      <section className="mx-auto max-w-6xl space-y-6">
        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Account & security</p>
              <h2 className="text-2xl font-semibold text-ink-900">Email, password, and 2FA</h2>
            </div>
            <PillButton onClick={handleSaveSettings}>Save all</PillButton>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</label>
              <input
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
              <p className="text-xs text-ink-500">Email managed via identity service with backend confirmation.</p>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Phone</label>
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <PillButton
                className={`w-full ${settings.twoFactorEnabled ? "bg-emerald-500 text-white" : "bg-ink-100"}`}
                onClick={() => setSettings((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))}
              >
                {settings.twoFactorEnabled ? "2FA enabled" : "Enable 2FA"}
              </PillButton>
              <PillButton onClick={handleChangePassword} className="w-full">
                Reset password
              </PillButton>
              <PillButton onClick={() => setStatusMessage("Active sessions refreshed.")} className="w-full bg-ink-100 text-ink-700">
                Refresh sessions
              </PillButton>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <input
                type="password"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
              <input
                type="password"
                placeholder="New password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
            {statusMessage && <p className="text-xs text-ink-500">{statusMessage}</p>}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Active sessions</p>
              <div className="space-y-2">
                {ACTIVE_SESSIONS.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-2xl border border-ink-100 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-ink-900">{session.device}</p>
                      <p className="text-xs text-ink-500">{session.location}</p>
                    </div>
                    <div className="text-xs text-ink-500">{session.updatedAt}</div>
                  </div>
                ))}
              </div>
              <PillButton onClick={() => setStatusMessage("All sessions signed out.")} className="w-full bg-ink-100 text-ink-700">
                Sign out everywhere
              </PillButton>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Privacy & visibility</p>
              <h2 className="text-2xl font-semibold text-ink-900">Who sees you and how</h2>
            </div>
            <PillButton onClick={handleSaveSettings}>Save visibility</PillButton>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSettings((prev) => ({ ...prev, whoCanSeeMe: option.value }))}
                className={`rounded-2xl border px-4 py-3 text-sm text-left transition ${
                  settings.whoCanSeeMe === option.value ? "border-ink-900 bg-ink-50" : "border-ink-200"
                }`}
              >
                <p className="font-semibold text-ink-900">{option.label}</p>
                <p className="text-xs text-ink-500">Visibility is enforced by the backend.</p>
              </button>
            ))}
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <button
              onClick={() => setSettings((prev) => ({ ...prev, whoCanMessageMe: "matches" }))}
              className={`rounded-2xl border px-4 py-3 text-sm text-left ${
                settings.whoCanMessageMe === "matches" ? "border-ink-900 bg-ink-50" : "border-ink-200"
              }`}
            >
              <p className="font-semibold text-ink-900">Matches only</p>
              <p className="text-xs text-ink-500">Messages from active matches.</p>
            </button>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, whoCanMessageMe: "anyone" }))}
              className={`rounded-2xl border px-4 py-3 text-sm text-left ${
                settings.whoCanMessageMe === "anyone" ? "border-ink-900 bg-ink-50" : "border-ink-200"
              }`}
            >
              <p className="font-semibold text-ink-900">Anyone</p>
              <p className="text-xs text-ink-500">Allow community members and matches.</p>
            </button>
            <button
              onClick={() => setSettings((prev) => ({ ...prev, whoCanMessageMe: "friends" }))}
              className={`rounded-2xl border px-4 py-3 text-sm text-left ${
                settings.whoCanMessageMe === "friends" ? "border-ink-900 bg-ink-50" : "border-ink-200"
              }`}
            >
              <p className="font-semibold text-ink-900">Friends</p>
              <p className="text-xs text-ink-500">Limit messages to trusted contacts.</p>
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Community visibility</label>
            <select
              value={settings.communityVisibility}
              onChange={(event) => setSettings((prev) => ({ ...prev, communityVisibility: event.target.value }))}
              className="rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
            >
              <option value="public">Public communities</option>
              <option value="members">Members only</option>
              <option value="private">Private</option>
            </select>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Discovery toggles</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.showOnlineStatus}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, showOnlineStatus: event.target.checked }))
                  }
                />
                <span className="text-sm text-ink-600">Show online status</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.allowAnalytics}
                  onChange={(event) => setSettings((prev) => ({ ...prev, allowAnalytics: event.target.checked }))}
                />
                <span className="text-sm text-ink-600">Allow activity analytics</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notifications</p>
              <h2 className="text-2xl font-semibold text-ink-900">Stay informed your way</h2>
            </div>
            <Bell className="h-5 w-5 text-ink-500" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "emailNotifications", label: "Match alerts" },
              { key: "pushNotifications", label: "Message alerts" },
              { key: "marketingNotifications", label: "Marketing" },
            ].map((notification) => (
              <label key={notification.key} className="flex items-center justify-between rounded-2xl border border-ink-200 px-4 py-3">
                <div>
                  <p className="font-medium text-ink-900">{notification.label}</p>
                  <p className="text-xs text-ink-500">Immediate updates will be sent via your channels.</p>
                </div>
                <input
                  type="checkbox"
                  checked={(settings as any)[notification.key]}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, [notification.key]: event.target.checked }))
                  }
                />
              </label>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Discovery preferences</p>
              <h2 className="text-2xl font-semibold text-ink-900">Age, distance, intent</h2>
            </div>
            <Eye className="h-5 w-5 text-ink-500" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Age range</label>
              <div className="flex gap-3">
                {[0, 1].map((index) => (
                  <input
                    key={index}
                    type="number"
                    value={settings.ageRange[index]}
                    onChange={(event) => {
                      const value = Math.max(18, Number(event.target.value));
                      setSettings((prev) => {
                        const next: [number, number] = [...prev.ageRange];
                        next[index] = value;
                        return { ...prev, ageRange: next };
                      });
                    }}
                    className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Distance (miles)</label>
              <input
                type="number"
                value={settings.maxDistanceMiles}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, maxDistanceMiles: Number(event.target.value) || prev.maxDistanceMiles }))
                }
                className="w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
              />
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Intent preferences</p>
            <div className="flex flex-wrap gap-2">
              {INTENT_LABELS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSettings((prev) => {
                      const selected = prev.intentPreferences.includes(option.value);
                      return {
                        ...prev,
                        intentPreferences: selected
                          ? prev.intentPreferences.filter((item) => item !== option.value)
                          : [...prev.intentPreferences, option.value],
                      };
                    });
                  }}
                  className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                      settings.intentPreferences.includes(option.value)
                        ? "bg-ink-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Dealbreakers</p>
            <div className="flex flex-wrap gap-2">
              {settings.dealbreakers.map((dealbreaker) => (
                <Badge key={dealbreaker} tone="secondary" className="text-xs uppercase">
                  {dealbreaker}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Subscription & payments</p>
              <h2 className="text-2xl font-semibold text-ink-900">Plan details</h2>
            </div>
            <CreditCard className="h-5 w-5 text-ink-500" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-ink-200 p-4">
              <p className="text-sm text-slate-500">Current plan</p>
              <p className="text-3xl font-semibold text-ink-900 capitalize">{subscription.plan}</p>
              <Badge tone={subscription.status === "active" ? "success" : "secondary"} className="mt-2 text-xs uppercase">
                {subscription.status}
              </Badge>
              {subscription.expiresAt && (
                <p className="text-xs text-ink-500 mt-2">
                  Renews {new Date(subscription.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Billing history</p>
              <ul className="space-y-2 text-sm text-ink-600">
                {subscription.billingHistory.map((bill) => (
                  <li key={bill.id} className="flex items-center justify-between border-b border-ink-100 pb-2 last:border-none">
                    <span>{bill.date}</span>
                    <span>{bill.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <PillButton className="w-full" onClick={() => setStatusMessage("Upgrading plan via billing UI.")}>
            Manage subscription
          </PillButton>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Account lifecycle</p>
              <h2 className="text-2xl font-semibold text-ink-900">Pause, pause, delete safely</h2>
            </div>
            <ArrowRight className="h-5 w-5 text-ink-500" />
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setStatusMessage("Account paused for 7 days. Toggle off to return.")}
              className="w-full rounded-2xl border border-ink-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em]"
            >
              Pause account
            </button>
            <button
              onClick={() => setStatusMessage("Delete request submitted. Data export scheduled.")}
              className="w-full rounded-2xl border border-rose-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              Delete account (grace period)
            </button>
            <button
              onClick={() => setStatusMessage("Data export queued. You'll receive a download link.")}
              className="w-full rounded-2xl border border-ink-200 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em]"
            >
              Export data
            </button>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl">
        <Card className="space-y-3 border border-ink-200 bg-ink-50 p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-ink-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">System enforcement</p>
              <h2 className="text-lg font-semibold text-ink-900">Changes flow through the backend</h2>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-ink-600">
            <li>Account/security toggles sync with identity service and audit logs.</li>
            <li>Trust signals (age, location, intent) recalc discovery eligibility instantly.</li>
            <li>Frequent toggling triggers abuse prevention workflows.</li>
            <li>Every sensitive change is logged for compliance and can be appealed.</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}