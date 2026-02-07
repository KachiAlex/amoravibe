"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Badge, Card, PillButton } from "@/lib/ui-components";
import {
  Award,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  Lock,
  Globe,
  Heart,
  ArrowUp,
  ArrowDown,
  Shuffle,
} from "lucide-react";

interface UserProfile {
  id: string;
  displayName: string;
  age?: number;
  bio?: string;
  photos?: string[];
  interests?: string[];
  tags?: string[];
  prompts?: string[];
  location?: string;
  isVerified: boolean;
  createdAt: string;
}

interface PrivateProfile {
  sexualOrientation?: string;
  genderIdentity?: string;
  pronouns?: string;
  relationshipGoal?: string;
  lastIdentityUpdateAt?: string;
}

interface ProfileHealth {
  completenessPercent: number;
  trustScore: number;
  communityStanding: number;
  reportHistory: number;
}

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicProfile, setPublicProfile] = useState<UserProfile | null>(null);
  const [privateProfile, setPrivateProfile] = useState<PrivateProfile | null>(null);
  const [profileHealth, setProfileHealth] = useState<ProfileHealth | null>(null);
  const [editing, setEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [profileHidden, setProfileHidden] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    sexualOrientation: "",
    genderIdentity: "",
    pronouns: "",
    relationshipGoal: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [visibilityPriority, setVisibilityPriority] = useState<string[]>([
    "Verified matches",
    "Communities",
    "Public search",
  ]);

  useEffect(() => {
    const initialize = async () => {
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
    initialize();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [publicRes, privateRes, healthRes] = await Promise.all([
          fetch(`/api/dashboard/profile/public?userId=${userId}`),
          fetch(`/api/dashboard/profile/private?userId=${userId}`),
          fetch(`/api/dashboard/safety/profile-health?userId=${userId}`),
        ]);

        if (publicRes.ok) {
          const data = await publicRes.json();
          setPublicProfile(data.profile ?? null);
          setFormData((prev) => ({
            ...prev,
            displayName: data.profile?.displayName ?? "",
            bio: data.profile?.bio ?? "",
            location: data.profile?.location ?? "",
          }));
        }

        if (privateRes.ok) {
          const data = await privateRes.json();
          setPrivateProfile(data.profile ?? null);
          setFormData((prev) => ({
            ...prev,
            sexualOrientation: data.profile?.sexualOrientation ?? "",
            genderIdentity: data.profile?.genderIdentity ?? "",
            pronouns: data.profile?.pronouns ?? "",
            relationshipGoal: data.profile?.relationshipGoal ?? "",
          }));
        }

        if (healthRes.ok) {
          const data = await healthRes.json();
          setProfileHealth(data.health ?? null);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!userId) return;
    try {
      setSavingProfile(true);
      const [publicRes, privateRes] = await Promise.all([
        fetch(`/api/dashboard/profile/public`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            displayName: formData.displayName,
            bio: formData.bio,
            location: formData.location,
          }),
        }),
        fetch(`/api/dashboard/profile/private`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            sexualOrientation: formData.sexualOrientation,
            genderIdentity: formData.genderIdentity,
            pronouns: formData.pronouns,
            relationshipGoal: formData.relationshipGoal,
          }),
        }),
      ]);

      if (publicRes.ok && privateRes.ok) {
        const publicData = await publicRes.json();
        const privateData = await privateRes.json();
        setPublicProfile(publicData.profile ?? publicProfile);
        setPrivateProfile(privateData.profile ?? privateProfile);
        setEditing(false);
        setStatusMessage(
          "Profile updates saved. Sensitive identity changes may trigger review and cooldowns before discovery adjustments."
        );
      }
    } catch (error) {
      console.error("Failed to save profile", error);
      setStatusMessage("Unable to save profile right now.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreview = () => setPreviewMode((prev) => !prev);

  const toggleHidden = () => {
    setProfileHidden((prev) => {
      const next = !prev;
      setStatusMessage(next ? "Profile hidden temporarily." : "Profile restored.");
      return next;
    });
  };

  const movePriority = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= visibilityPriority.length) {
      return;
    }
    const swapped = [...visibilityPriority];
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
    setVisibilityPriority(swapped);
  };

  const prompts = useMemo(() => publicProfile?.prompts ?? ["Share a prompt that sparks conversation."], [publicProfile?.prompts]);
  const interests = useMemo(() => publicProfile?.interests ?? ["Community-first", "Trust signals"], [publicProfile?.interests]);

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit">
            Profile
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Sign in to manage your identity</h1>
          <p className="text-ink-700">Complete onboarding to control visibility and trust settings.</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto max-w-6xl space-y-6">
        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile</p>
              <h1 className="font-display text-4xl text-ink-900">{publicProfile?.displayName ?? "Your name"}</h1>
              {publicProfile?.location && <p className="text-sm text-ink-500">{publicProfile.location}</p>}
            </div>
            <div className="flex gap-3">
              <PillButton onClick={handlePreview} className="flex items-center gap-2">
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? "Close preview" : "Preview as others see you"}
              </PillButton>
              <PillButton onClick={toggleHidden} className="flex items-center gap-2">
                {profileHidden ? <Check className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {profileHidden ? "Unhide profile" : "Hide profile temporarily"}
              </PillButton>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Badge tone={publicProfile?.isVerified ? "success" : "secondary"} className="text-xs uppercase">
              {publicProfile?.isVerified ? "Verified" : "Unverified"}
            </Badge>
            <Badge tone="secondary" className="text-xs uppercase">
              {previewMode ? "Preview mode" : profileHidden ? "Hidden" : "Live"}
            </Badge>
            <Badge tone="secondary" className="text-xs uppercase">
              Trust {profileHealth?.trustScore ?? 0}
            </Badge>
          </div>
          {statusMessage && <p className="text-xs text-ink-600">{statusMessage}</p>}
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink-900">Public profile</h2>
              <button
                onClick={() => setEditing((prev) => !prev)}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                {editing ? "Editing" : "Edit"}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {(publicProfile?.photos ?? []).slice(0, 4).map((photo) => (
                <div key={photo} className="h-24 w-24 overflow-hidden rounded-2xl bg-slate-100">
                  <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                </div>
              ))}
              {(!publicProfile?.photos || publicProfile.photos.length === 0) && (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-500">
                  Add photos
                </div>
              )}
            </div>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Display name</label>
                  <input
                    value={formData.displayName}
                    onChange={(event) => setFormData((prev) => ({ ...prev, displayName: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(event) => setFormData((prev) => ({ ...prev, bio: event.target.value }))}
                    rows={3}
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.3em] text-slate-500">Location</label>
                  <input
                    value={formData.location}
                    onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-ink-700">{publicProfile?.bio ?? "Share a short bio to set the tone."}</p>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <Badge key={interest} tone="secondary" className="text-xs uppercase">
                      {interest}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Prompts</p>
                  {prompts.map((prompt) => (
                    <p key={prompt} className="text-sm text-ink-600">
                      • {prompt}
                    </p>
                  ))}
                </div>
              </>
            )}
            {editing && (
              <div className="flex gap-3">
                <PillButton onClick={handleSaveProfile} disabled={savingProfile} className="flex-1">
                  {savingProfile ? "Saving…" : "Save"}
                </PillButton>
                <PillButton
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-ink-100 text-ink-700 hover:bg-ink-200"
                >
                  Cancel
                </PillButton>
              </div>
            )}
          </Card>

          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Identity & orientation</p>
                <h2 className="text-xl font-semibold text-ink-900">Sensitive settings</h2>
              </div>
              <Badge tone="primary" className="text-xs uppercase">
                Review required
              </Badge>
            </div>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Gender identity</p>
                <p className="text-ink-700">{privateProfile?.genderIdentity ?? "Unspecified"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Sexual orientation</p>
                <p className="text-ink-700">{privateProfile?.sexualOrientation ?? "Unspecified"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Pronouns</p>
                <p className="text-ink-700">{privateProfile?.pronouns ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Intent</p>
                <p className="text-ink-700">{privateProfile?.relationshipGoal ?? "Dating"}</p>
              </div>
            </div>
            {editing && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Gender identity</label>
                  <input
                    value={formData.genderIdentity}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, genderIdentity: event.target.value }))
                    }
                    placeholder="She/Her, They/Them"
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Sexual orientation</label>
                  <input
                    value={formData.sexualOrientation}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, sexualOrientation: event.target.value }))
                    }
                    placeholder="Queer, Pansexual"
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Pronouns</label>
                  <input
                    value={formData.pronouns}
                    onChange={(event) => setFormData((prev) => ({ ...prev, pronouns: event.target.value }))}
                    placeholder="They/Them"
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Intent</label>
                  <input
                    value={formData.relationshipGoal}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, relationshipGoal: event.target.value }))
                    }
                    placeholder="Serious relationships, dating, friends"
                    className="mt-1 w-full rounded-2xl border border-ink-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900"
                  />
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-ink-100 bg-ink-50/70 p-3 text-xs text-ink-500">
              Changes to identity data trigger a cooldown + review; matching and discovery eligibility recalc instantly to keep orientation-safe spaces intact.
            </div>
          </Card>
        </div>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile health indicators</p>
              <h2 className="text-xl font-semibold text-ink-900">Signals that summarize trust</h2>
            </div>
            <Badge tone="secondary" className="text-xs uppercase">
              GDPR-compliant
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Profile completeness</p>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                  style={{ width: `${profileHealth?.completenessPercent ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-ink-500">{profileHealth?.completenessPercent ?? 0}% complete</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Trust score</p>
              <p className="text-2xl font-semibold text-ink-900">{profileHealth?.trustScore ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Community standing</p>
              <p className="text-2xl font-semibold text-ink-900">{profileHealth?.communityStanding ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Private report history</p>
              <p className="text-sm text-ink-500">{profileHealth?.reportHistory ?? 0} logged (private)</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Advanced features</p>
              <h2 className="text-xl font-semibold text-ink-900">Control visibility + trust</h2>
            </div>
            <Badge tone="primary" className="text-xs uppercase">
              Intentional design
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Profile preview</p>
              <p className="text-sm text-ink-600">See how the world perceives you without leaving the editor.</p>
              <PillButton onClick={handlePreview} className="flex items-center gap-2">
                <Eye className="h-4 w-4" /> {previewMode ? "Preview open" : "Open preview"}
              </PillButton>
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hide profile</p>
              <p className="text-sm text-ink-600">Toggle visibility temporarily without data loss.</p>
              <PillButton onClick={toggleHidden} className="flex items-center gap-2">
                {profileHidden ? <Check className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {profileHidden ? "Visible" : "Hidden"}
              </PillButton>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Visibility priority</p>
            <div className="space-y-2">
              {visibilityPriority.map((item, index) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-ink-200 px-3 py-2">
                  <div className="flex items-center gap-3 text-sm font-medium text-ink-800">
                    <Shuffle className="h-4 w-4 text-ink-500" /> {item}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => movePriority(index, "up")}
                      className="rounded-full border border-ink-200 p-1 text-xs text-ink-500"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => movePriority(index, "down")}
                      className="rounded-full border border-ink-200 p-1 text-xs text-ink-500"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-500">
              <Award className="h-4 w-4 text-ink-400" /> Fake or inconsistent changes trigger alerts and orientation adjustments stay logged.
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}