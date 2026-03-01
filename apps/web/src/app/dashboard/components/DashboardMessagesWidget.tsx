"use client";
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import type { Message } from '../types';

const quickFilters = (
  counts: { unread: number; muted: number; archived: number }
) => [
  { label: 'Unread', href: '/dashboard/messages?filter=unread', count: counts.unread },
  { label: 'Muted', href: '/dashboard/messages?filter=muted', count: counts.muted },
  { label: 'Archived', href: '/dashboard/messages?filter=archived', count: counts.archived },
];

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardMessagesWidget({ messages = [] }: { messages?: Message[] }) {
  const { data } = useSWR('/api/messages?limit=4', fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const hydrated = Array.isArray(data?.messages) ? data.messages : messages;
  const unreadCount = hydrated.filter((m: Message) => Boolean(m.unread)).length;
  const mutedCount = hydrated.filter((m: Message) => Boolean(m.muted)).length;
  const archivedCount = hydrated.filter((m: Message) => Boolean(m.archived)).length;
  const filters = quickFilters({ unread: unreadCount, muted: mutedCount, archived: archivedCount });
  const visible = hydrated.slice(0, 4);

  return (
    <section aria-label="Recent messages" className="rounded-3xl bg-white/90 border border-gray-100 shadow-lg p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent messages</h2>
          <p className="text-sm text-gray-500">Jump back into conversations or open the inbox for full controls.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.href}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <span>{filter.label}</span>
              <span className="text-gray-400">{filter.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3" role="list">
        {visible.map((message) => (
          <Link
            href={`/dashboard/messages/${message.id}`}
            role="listitem"
            key={message.id}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow hover:bg-white"
          >
            <div className="relative">
              <Image
                src={message.avatar ?? '/images/default-avatar.png'}
                alt={`${message.from} avatar`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover border-2 border-gray-100"
                unoptimized
              />
              {message.unread ? (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                  New
                </span>
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-900 truncate">{message.from}</span>
                {message.time && <span className="text-xs text-gray-500 whitespace-nowrap">{message.time}</span>}
              </div>
              <p className="text-sm text-gray-500 truncate">{message.preview ?? message.text ?? 'New conversation'}</p>
            </div>
          </Link>
        ))}
        {visible.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
            No conversations yet. Head to the inbox to start chatting!
          </div>
        )}
      </div>

      <div className="mt-6 text-right">
        <Link
          href="/dashboard/messages"
          className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Open inbox ↗
        </Link>
      </div>
    </section>
  );
}
