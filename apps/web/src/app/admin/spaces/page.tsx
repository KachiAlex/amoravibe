import Container from '@/app/admin/Container';
import { requireAdminUser } from '@/lib/admin-auth';
import prisma from '@/lib/db';
import { Suspense } from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getSpaces() {
  await requireAdminUser();
  const spaces = await prisma.space.findMany({
    include: { _count: { select: { members: true } } },
  });
  return spaces.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    orientation: s.orientation,
    memberCount: s._count?.members ?? 0,
  }));
}

export default async function AdminSpacesPage() {
  const spaces = await getSpaces();
  return (
    <Container>
      <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-white">Spaces Management</h2>
        <Link
          href="/admin/spaces/create"
          className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          Create New Space
        </Link>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {spaces.map((space) => (
            <div key={space.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-lg font-semibold text-white">{space.name}</h3>
              <p className="text-sm text-slate-400">{space.description}</p>
              <p className="mt-2 text-xs text-slate-300">Orientation: {space.orientation}</p>
              <p className="text-xs text-slate-300">Members: {space.memberCount}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
