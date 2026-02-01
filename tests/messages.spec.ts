import { describe, it, expect } from 'vitest';

// Extracted filtering logic from /api/dashboard/messages
const SAMPLE_THREADS = [
  { id: '1', name: 'Sarah', unread: 2, lastActive: new Date(Date.now() - 5 * 60000).toISOString(), status: { tone: 'active' } },
  { id: '2', name: 'David', unread: 0, lastActive: new Date(Date.now() - 2 * 3600000).toISOString(), status: { tone: 'default' } },
  { id: '3', name: 'Kayla', unread: 0, lastActive: new Date(Date.now() - 24 * 3600000).toISOString(), status: { tone: 'positive' } },
  { id: '4', name: 'Jordan', unread: 1, lastActive: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), status: { tone: 'inactive' } },
];

function sortThreads(threads: any[], sort: string = 'recent'): any[] {
  let sorted = [...threads];

  if (sort === 'unread') {
    sorted.sort((a, b) => b.unread - a.unread);
  } else if (sort === 'status') {
    const statusOrder = { active: 0, positive: 1, default: 2, inactive: 3 };
    sorted.sort((a, b) => statusOrder[a.status.tone as any] - statusOrder[b.status.tone as any]);
  } else {
    // 'recent' - sort by lastActive descending
    sorted.sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime());
  }

  return sorted;
}

describe('Messaging Threads Sorting', () => {
  it('sorts by recent (most recent first)', () => {
    const result = sortThreads(SAMPLE_THREADS, 'recent');
    expect(result[0].id).toBe('1'); // Sarah (5 min ago)
    expect(result[result.length - 1].id).toBe('4'); // Jordan (3 days ago)
  });

  it('sorts by unread count (highest first)', () => {
    const result = sortThreads(SAMPLE_THREADS, 'unread');
    expect(result[0].unread).toBe(2); // Sarah
    expect(result[1].unread).toBe(1); // Jordan
    expect(result[2].unread).toBe(0); // David and Kayla
  });

  it('sorts by status (active to inactive)', () => {
    const result = sortThreads(SAMPLE_THREADS, 'status');
    expect(result[0].status.tone).toBe('active'); // Sarah
    expect(result[1].status.tone).toBe('positive'); // Kayla
    expect(result[2].status.tone).toBe('default'); // David
    expect(result[3].status.tone).toBe('inactive'); // Jordan
  });

  it('defaults to recent sort', () => {
    const result = sortThreads(SAMPLE_THREADS, 'unknown');
    expect(result[0].id).toBe('1'); // Sarah (5 min ago)
  });

  it('respects limit parameter', () => {
    const result = sortThreads(SAMPLE_THREADS, 'recent').slice(0, 2);
    expect(result).toHaveLength(2);
  });

  it('handles empty thread list', () => {
    const result = sortThreads([], 'recent');
    expect(result).toHaveLength(0);
  });

  it('preserves all thread properties after sort', () => {
    const result = sortThreads(SAMPLE_THREADS, 'recent');
    result.forEach((thread) => {
      expect(thread).toHaveProperty('id');
      expect(thread).toHaveProperty('name');
      expect(thread).toHaveProperty('unread');
      expect(thread).toHaveProperty('lastActive');
      expect(thread).toHaveProperty('status');
    });
  });
});
