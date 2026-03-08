'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (e) {
      // ignore errors
    }
    router.push('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
    >
      Sign out
    </button>
  );
}
