import Link from 'next/link';
import { Suspense } from 'react';
import { requireAdminUser } from '@/lib/admin-auth';
import { queryAdminUsers } from '@/lib/admin-users';
import ManageUserButton from './ManageUserButton';
import Container from '@/app/admin/Container';

export const dynamic = 'force-dynamic';

type SearchParamsInput = Record<string, string | string[] | undefined>;

interface UsersPageProps {
  searchParams?: SearchParamsInput | Promise<SearchParamsInput>;
}

type RoleFilter = 'all' | 'user' | 'admin';
type StatusFilter = 'all' | 'active' | 'banned';

const ROLE_FILTERS = [
  { value: 'all', label: 'All roles' },
  { value: 'user', label: 'Members' },
  { value: 'admin', label: 'Admins' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'banned', label: 'Banned' },
];

function getSingle(param?: string | string[] | null) {
  if (Array.isArray(param)) return param[0];
  return param ?? undefined;
}

interface FilterState {
  page: number;
  search?: string;
  role: RoleFilter;
  status: StatusFilter;
}

function parseFilters(searchParams?: SearchParamsInput): FilterState {
  const page = Math.max(1, Number(getSingle(searchParams?.page)) || 1);
  const search = getSingle(searchParams?.search) || undefined;
  const rawRole = getSingle(searchParams?.role);
  const rawStatus = getSingle(searchParams?.status);

  const role: RoleFilter = rawRole === 'admin' || rawRole === 'user' ? rawRole : 'all';
  const status: StatusFilter = rawStatus === 'active' || rawStatus === 'banned' ? rawStatus : 'all';

  return { page, search, role, status };
}

type QueryState = Record<string, string | undefined>;

function toQueryState(filters: FilterState): QueryState {
  const next: QueryState = {};
  if (filters.page > 1) next.page = String(filters.page);
  if (filters.search) next.search = filters.search;
  if (filters.role !== 'all') next.role = filters.role;
  if (filters.status !== 'all') next.status = filters.status;
  return next;
}

function buildQuery(base: QueryState, updates: Record<string, string | undefined | null>) {
  const merged: QueryState = { ...base };
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null || value === '') {
      delete merged[key];
    } else {
      merged[key] = value;
    }
  }
  const params = new URLSearchParams();
  Object.entries(merged).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : '/admin/users';
}

async function UsersTable({ filters, queryState }: { filters: FilterState; queryState: QueryState }) {
  const { page, search, role, status } = filters;
  const { users, total, totalPages } = await queryAdminUsers({
    page,
    search,
    role: role === 'all' ? undefined : role,
    status,
  });

  const prevHref = buildQuery(queryState, { page: page > 1 ? String(page - 1) : undefined });
  const nextHref = buildQuery(queryState, {
    page: page < totalPages ? String(page + 1) : String(totalPages),
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.3em] text-slate-400">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="text-slate-200">
                <td className="px-6 py-4">
                  <p className="font-semibold text-white">{user.displayName ?? user.email}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.banned ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    {user.banned ? 'banned' : 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <ManageUserButton
                    userId={user.id}
                    email={user.email}
                    displayName={user.displayName ?? user.email}
                    initialRole={(user.role as 'admin' | 'user') ?? 'user'}
                    initialBanned={user.banned}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 text-xs text-slate-400">
        <p>
          Showing page {page} of {totalPages} • {total.toLocaleString()} users
        </p>
        <div className="space-x-2">
          <Link
            href={prevHref}
            className="rounded-full border border-white/20 px-3 py-1 text-white hover:bg-white/10"
          >
            Prev
          </Link>
          <Link
            href={nextHref}
            className="rounded-full border border-white/20 px-3 py-1 text-white hover:bg-white/10"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  await requireAdminUser();
  const resolved = searchParams && 'then' in searchParams ? await searchParams : searchParams;
  const filters = parseFilters(resolved);
  const queryState = toQueryState(filters);

  const searchAction = '/admin/users';

  return (
    <Container>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Control</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">User registry</h2>
            <p className="text-sm text-slate-400">Search, filter, and intervene on any member profile.</p>
          </div>
          <form method="get" action={searchAction} className="flex gap-3">
            {filters.role !== 'all' && <input type="hidden" name="role" value={filters.role} />}
            {filters.status !== 'all' && <input type="hidden" name="status" value={filters.status} />}
            <input
              type="search"
              name="search"
              placeholder="Search email or name"
              defaultValue={filters.search}
              className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
            >
              Search
            </button>
            {filters.search && (
              <Link
                href={buildQuery(queryState, { search: undefined, page: undefined })}
                className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em]">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status:</span>
            {STATUS_FILTERS.map((filter) => {
              const active = filters.status === filter.value;
              const href = buildQuery(queryState, {
                status: filter.value === 'all' ? undefined : filter.value,
                page: undefined,
              });
              return (
                <Link
                  key={filter.value}
                  href={href}
                  className={`rounded-full border px-3 py-1 ${
                    active ? 'border-white bg-white text-slate-950' : 'border-white/20 text-slate-300 hover:border-white/60'
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Role:</span>
            {ROLE_FILTERS.map((filter) => {
              const active = filters.role === filter.value;
              const href = buildQuery(queryState, {
                role: filter.value === 'all' ? undefined : filter.value,
                page: undefined,
              });
              return (
                <Link
                  key={filter.value}
                  href={href}
                  className={`rounded-full border px-3 py-1 ${
                    active ? 'border-white bg-white text-slate-950' : 'border-white/20 text-slate-300 hover:border-white/60'
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>

        <Suspense fallback={<div className="h-64 rounded-2xl bg-white/5" />}>
          {/* @ts-expect-error Async Server Component */}
          <UsersTable filters={filters} queryState={queryState} />
        </Suspense>
      </div>
    </Container>
  );
}