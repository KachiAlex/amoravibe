import type { MatchCandidate } from '@lovedate/api';
import { Badge, Card, PillButton } from '@lovedate/ui';
import Image from 'next/image';
import Link from 'next/link';
import { lovedateApi } from '@/lib/api';
import { getSession } from '@/lib/session';

interface MatchesPageProps {
  searchParams?: Promise<{ userId?: string; limit?: string }> | { userId?: string; limit?: string };
}

async function loadMatches(userId: string, limit?: number): Promise<MatchCandidate[] | null> {
  try {
    return await lovedateApi.fetchMatches({ userId, limit });
  } catch (error) {
    console.error('Failed to load matches', error);
    return null;
  }
}

export default async function MatchesPage(props: MatchesPageProps) {
  const resolvedParams = await Promise.resolve(props.searchParams ?? {});
  const session = getSession();
  const userId = resolvedParams.userId ?? session?.userId ?? null;
  const limit = resolvedParams.limit ? Number(resolvedParams.limit) : undefined;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-4">
          <Badge tone="primary" className="mx-auto w-fit bg-rose-500/10 text-rose-500">
            Discovery
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">Find your Lovedate orbit</h1>
          <p className="text-ink-700">
            You&apos;re not signed in yet. Complete onboarding so we can personalize your discovery
            queue automatically.
          </p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href="/onboarding">Finish onboarding first</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard">View trust dashboard</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  const matches = await loadMatches(userId, Number.isFinite(limit) ? limit : undefined);

  if (!matches) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <Card className="space-y-3">
          <Badge tone="primary" className="mx-auto w-fit bg-amber-500/10 text-amber-600">
            Discovery paused
          </Badge>
          <h1 className="font-display text-3xl text-ink-900">We couldn’t load matches</h1>
          <p className="text-ink-700">Give it another go in a moment or retry onboarding.</p>
          <div className="flex justify-center gap-3">
            <PillButton asChild>
              <Link href={`/matches?userId=${encodeURIComponent(userId)}`}>Refresh matches</Link>
            </PillButton>
            <PillButton variant="outline" asChild>
              <Link href="/dashboard">Trust dashboard</Link>
            </PillButton>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-10 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <section className="mx-auto flex max-w-6xl flex-col gap-6 rounded-[36px] border border-white/40 bg-white/90 p-8 shadow-[0_30px_100px_rgba(13,15,26,0.12)] backdrop-blur">
        <div>
          <Badge tone="primary" className="mb-4 bg-purple-500/10 text-purple-600">
            Discovery space
          </Badge>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-4xl text-ink-900">Your curated orbit</h1>
              <p className="mt-2 max-w-2xl text-lg text-ink-700">
                Lovedate surfaces members who share your discovery preferences, trust posture, and
                vibe. Keep an open mind and a respectful tone—our safety systems are always on.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm uppercase tracking-[0.3em] text-ink-700/70">Queue health</p>
              <p className="text-4xl font-semibold text-ink-900">{matches.length}</p>
              <p className="text-sm text-ink-600">active introductions</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-ink-700">
          <span className="rounded-full bg-white/70 px-4 py-2">User ID {userId}</span>
          <span className="rounded-full bg-white/70 px-4 py-2">Max batch {limit ?? 12}</span>
          <span className="rounded-full bg-white/70 px-4 py-2">Signal aligned</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
        {matches.length === 0 ? (
          <Card className="col-span-full space-y-3 text-center">
            <h2 className="font-display text-2xl text-ink-900">No intros yet</h2>
            <p className="text-ink-700">
              Complete more of your profile or raise your trust score to see compatible members.
            </p>
            <PillButton asChild>
              <Link href={`/dashboard?userId=${encodeURIComponent(userId)}`}>
                Tune trust signals
              </Link>
            </PillButton>
          </Card>
        ) : (
          matches.map((match) => <MatchCard key={match.id} match={match} />)
        )}
      </section>
    </main>
  );
}

function MatchCard({ match }: { match: MatchCandidate }) {
  const primaryPhoto = match.photos[0];
  const compatibilityTone = match.compatibilityScore >= 75 ? 'text-emerald-600' : 'text-ink-700';

  return (
    <Card className="flex flex-col">
      {primaryPhoto ? (
        <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-3xl bg-sand-100">
          <Image
            src={primaryPhoto}
            alt={`${match.displayName} profile photo`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="mb-4 aspect-[4/5] rounded-3xl bg-gradient-to-br from-ink-900 to-ink-700" />
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink-900">{match.displayName}</h2>
            <p className="text-sm text-ink-600">{match.city}</p>
          </div>
          <span className={`text-sm font-semibold ${compatibilityTone}`}>
            {match.compatibilityScore}% vibe match
          </span>
        </div>
        <p className="mt-3 flex-1 text-sm text-ink-700">
          {match.bio ?? 'This member prefers to reveal more in chat.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink-600">
          <Tag label={`Orientation • ${match.orientation}`} />
          <Tag label={`Discovery • ${match.discoverySpace}`} />
          <Tag label={match.isVerified ? 'Verified' : 'Pending verification'} />
        </div>
        <PillButton className="mt-6">Request intro</PillButton>
      </div>
    </Card>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full bg-sand-100 px-3 py-1 font-medium text-ink-700">{label}</span>
  );
}
