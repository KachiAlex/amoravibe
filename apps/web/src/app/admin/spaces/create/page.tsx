'use client';
import Container from '@/app/admin/Container';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateSpacePage() {
  // Ensure admin auth on server side via API; optional client check
  // Note: requireAdminUser is a server function; cannot be called here.
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', orientation: 'straight' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/spaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create space');
      }
      router.push('/admin/spaces');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Create New Space</h2>
        {error && <p className="text-rose-200 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="orientation">Orientation</label>
            <select
              id="orientation"
              name="orientation"
              value={form.orientation}
              onChange={handleChange}
              className="w-full rounded-md border border-white/20 bg-transparent px-3 py-2 text-white focus:outline-none"
            >
              <option value="straight">Straight</option>
              <option value="lgbtq">LGBTQ+</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Space'}
          </button>
        </form>
      </div>
    </Container>
  );
}
