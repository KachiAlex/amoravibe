"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Heart, Shield, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

const STORAGE_KEY = "onboarding_form_data";

interface OnboardingData {
  step: number;
  email: string;
  password: string;
  name: string;
  age: string;
  location: string;
  job: string;
  about: string;
  interests: string;
  gender: string;
  orientation: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  // Step 1: Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Step 2: Profile
  const [name, setName] = useState("");
  const [age, setAge] = useState(""); // keep as string for input
  const [location, setLocation] = useState("");
  const [job, setJob] = useState("");
  const [about, setAbout] = useState("");
  const [interests, setInterests] = useState("");
  const [gender, setGender] = useState("");
  const [orientation, setOrientation] = useState("");

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        JSON.parse(saved);
        setShowResumePrompt(true);
      } catch (err) {
        console.error("Failed to parse saved onboarding data", err);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const data: OnboardingData = {
      step,
      email,
      password,
      name,
      age,
      location,
      job,
      about,
      interests,
      gender,
      orientation,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [step, email, password, name, age, location, job, about, interests, gender, orientation]);

  function resumeOnboarding() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: OnboardingData = JSON.parse(saved);
        setStep(data.step);
        setEmail(data.email);
        setPassword(data.password);
        setName(data.name);
        setAge(data.age);
        setLocation(data.location);
        setJob(data.job);
        setAbout(data.about);
        setInterests(data.interests);
        setGender(data.gender);
        setOrientation(data.orientation);
        setShowResumePrompt(false);
      } catch (err) {
        console.error("Failed to resume onboarding", err);
        setShowResumePrompt(false);
      }
    }
  }

  function startFresh() {
    localStorage.removeItem(STORAGE_KEY);
    setStep(1);
    setEmail("");
    setPassword("");
    setName("");
    setAge("");
    setLocation("");
    setJob("");
    setAbout("");
    setInterests("");
    setGender("");
    setOrientation("");
    setShowResumePrompt(false);
  }

  function clearSavedData() {
    localStorage.removeItem(STORAGE_KEY);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log('[Onboarding] Starting signup with:', { email });
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('[Onboarding] Signup failed:', { status: res.status, error: errJson });
        throw new Error(errJson.error || "Signup failed");
      }
      const signupData = await res.json();
      console.log('[Onboarding] Signup response:', JSON.stringify(signupData));
      if (!signupData.userId) {
        throw new Error(`Signup succeeded but no userId returned: ${JSON.stringify(signupData)}`);
      }
      console.log('[Onboarding] Signup successful:', { userId: signupData.userId });

      // Sign in immediately after signup
      console.log('[Onboarding] Attempting sign-in after signup');
      const signin = await signIn("credentials", { redirect: false, email, password });
      console.log('[Onboarding] Sign-in result:', { ok: !signin?.error, error: signin?.error });
      if ((signin as any)?.error) {
        setError("Sign-in after signup failed. Please try signing in manually.");
        setLoading(false);
        return;
      }

      // Ensure legacy session cookie is set for APIs that expect `lovedate_session`
      try {
        await fetch('/api/auth/session-to-legacy', { method: 'POST' });
      } catch (err) {
        console.warn('Could not set legacy session cookie', err);
      }

      // Check if session is set
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        console.error('[Onboarding] Session check failed:', { status: sessionRes.status });
        setError("Session could not be established. Please sign in manually.");
        setLoading(false);
        return;
      }
      const sessionData = await sessionRes.json();
      console.log('[Onboarding] Session established:', { userId: (sessionData as any)?.userId });
      setStep(2);
    } catch (err: any) {
      console.error('[Onboarding] Signup error:', { message: err.message });
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSuccess() {
    clearSavedData();
    router.push("/dashboard");
  }

  async function handleProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('[Onboarding] handleProfile called', { name, age, location, job, about, interests, gender, orientation });
    try {
      const profileData = {
        name,
        displayName: name,
        age: age ? Number(age) : undefined,
        location,
        job,
        about,
        interests: interests.split(",").map((i) => i.trim()),
        gender,
        orientation,
        onboardingCompleted: true,
        onboardingStep: 'complete',
      };
      console.log('[Onboarding] Sending profile data:', profileData);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });
      console.log('[Onboarding] Profile response status:', res.status);
      const responseData = await res.json();
      console.log('[Onboarding] Profile response:', responseData);
      if (!res.ok) throw new Error(responseData.error || "Profile update failed");
      
      // Auto-assign user to correct space based on orientation
      const spaceOrientation = orientation === 'lgbtq' ? 'lgbtq' : 'straight';
      try {
        await fetch("/api/spaces/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ orientation: spaceOrientation }),
        });
      } catch (err) {
        console.warn("Failed to auto-assign space", err);
      }
      
      // Check if session is still valid before routing
      const sessionRes = await fetch("/api/auth/session");
      if (!sessionRes.ok) {
        setError("Session expired. Please sign in again.");
        setLoading(false);
        return;
      }
      await handleProfileSuccess();
    } catch (err: any) {
      setError(err.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-black">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-600/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Welcome to AmoraVibe
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            The dating platform built on trust, safety, and authentic connection.
          </p>
          <div className="mb-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Shield className="mb-3 h-8 w-8 text-purple-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Trust First</h3>
              <p className="text-sm text-gray-400">
                Biometric verification and safety checks protect every member
              </p>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Heart className="mb-3 h-8 w-8 text-pink-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Authentic</h3>
              <p className="text-sm text-gray-400">
                Real people, real connections, and genuine intentions
              </p>
            </div>
            <div className="rounded-lg border border-purple-500/20 bg-purple-900/10 p-6 backdrop-blur-sm">
              <Lock className="mb-3 h-8 w-8 text-blue-400 mx-auto" />
              <h3 className="mb-2 font-semibold text-white">Private</h3>
              <p className="text-sm text-gray-400">Your data stays encrypted and in your control</p>
            </div>
          </div>
          <div className="mb-8 space-y-4">
            {showResumePrompt && (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">Resume Your Onboarding?</h3>
                <p className="text-gray-300 mb-4">We found your previous progress. Would you like to continue where you left off?</p>
                <div className="flex gap-3">
                  <button
                    onClick={resumeOnboarding}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                  >
                    Resume
                  </button>
                  <button
                    onClick={startFresh}
                    className="flex-1 rounded-lg border border-gray-400 px-4 py-2 font-semibold text-gray-300 transition hover:border-gray-200 hover:text-white"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            )}
            {step === 1 && (
              <form onSubmit={handleSignup} className="space-y-4 bg-white/10 rounded-xl p-8 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Sign Up</h2>
                <input
                  type="email"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up & Continue"}
                </button>
                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleProfile} className="space-y-4 bg-white/10 rounded-xl p-8 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4">Complete Your Profile</h2>
                <input
                  type="text"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => {
                    if (process.env.NODE_ENV !== 'production') {
                      console.debug('onboarding:name:onChange', e.target.value);
                    }
                    setName(e.target.value);
                  }}
                  required
                />
                <input
                  type="number"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Age"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  required
                />
                <select
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
                <select
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  value={orientation}
                  onChange={e => setOrientation(e.target.value)}
                  required
                >
                  <option value="">Select Sexual Orientation</option>
                  <option value="straight">Straight</option>
                  <option value="lgbtq">LGBTQ+</option>
                </select>
                <input
                  type="text"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Job Title"
                  value={job}
                  onChange={e => setJob(e.target.value)}
                />
                <textarea
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="About Me"
                  value={about}
                  onChange={e => setAbout(e.target.value)}
                  rows={3}
                />
                <input
                  type="text"
                  className="w-full rounded-lg px-4 py-3 bg-white/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  placeholder="Interests (comma separated)"
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Finish & Go to Dashboard"}
                </button>
                <button
                  type="button"
                  className="w-full mt-2 rounded-lg border border-gray-400 px-8 py-3 font-semibold text-gray-300 transition hover:border-gray-200 hover:text-white"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
              </form>
            )}
          </div>
          <Link
            href="/"
            className="block rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition hover:border-gray-400 hover:text-white"
          >
            Back to Home
          </Link>
          <p className="text-xs text-gray-500 mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}