import { Card } from '@lovedate/ui';

export default function TrustCenterLoading() {
  return (
    <main className="space-y-16 px-6 pb-24 pt-12 sm:px-12 lg:px-20">
      <Card variant="highlight" className="mx-auto max-w-6xl animate-pulse">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="space-y-4">
            <div className="h-6 w-48 rounded-full bg-ink-900/10" />
            <div className="h-10 w-3/4 rounded-full bg-ink-900/10" />
            <div className="h-4 w-full rounded-full bg-ink-900/10" />
            <div className="flex gap-4">
              <div className="h-10 w-40 rounded-full bg-ink-900/10" />
              <div className="h-10 w-40 rounded-full bg-ink-900/10" />
            </div>
          </div>
          <Card className="w-full max-w-md border-ink-900/10 bg-white/80">
            <div className="space-y-4">
              <div className="h-4 w-32 rounded-full bg-ink-900/10" />
              <div className="h-6 w-full rounded-full bg-ink-900/10" />
              <div className="h-6 w-3/4 rounded-full bg-ink-900/10" />
              <div className="h-6 w-2/3 rounded-full bg-ink-900/10" />
            </div>
          </Card>
        </div>
      </Card>

      <section className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-48 animate-pulse border-ink-900/10 bg-white/80">
            <div className="space-y-4">
              <div className="h-4 w-24 rounded-full bg-ink-900/10" />
              <div className="h-6 w-2/3 rounded-full bg-ink-900/10" />
              <div className="h-4 w-full rounded-full bg-ink-900/10" />
              <div className="h-4 w-3/4 rounded-full bg-ink-900/10" />
            </div>
          </Card>
        ))}
      </section>
    </main>
  );
}
