"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AuthErrorPage() {
  const params = useSearchParams();
  const code = params?.get('error');
  const { title, description } = getAuthErrorMessage(code);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white flex items-center justify-center px-6">
      <div className="max-w-lg w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">Sign-in issue</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-sm text-white/80">{description}</p>
        <p className="mt-2 text-xs text-white/40">(Error code: {code || 'unknown'})</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/?openSignIn=1"
            className="rounded-2xl bg-white text-slate-900 font-semibold py-3 shadow-lg hover:shadow-xl transition"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="rounded-2xl border border-white/30 py-3 text-white/80 hover:text-white hover:border-white transition"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}
