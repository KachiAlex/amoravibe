'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RoleOption = 'user' | 'admin';

type ActionState = {
  role: RoleOption;
  banned: boolean;
};

interface ManageUserButtonProps {
  userId: string;
  email: string;
  displayName: string;
  initialRole: RoleOption;
  initialBanned: boolean;
}

async function parseJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}

export default function ManageUserButton(props: ManageUserButtonProps) {
  const { userId, email, displayName, initialRole, initialBanned } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ActionState>({ role: initialRole, banned: initialBanned });
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function mutate(endpoint: string, payload: Record<string, unknown>, successMessage: string, updater: () => void) {
    setPending(successMessage);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const body = await parseJson(response);
      if (!response.ok) {
        throw new Error(body?.message ?? 'Unable to complete request');
      }

      updater();
      setMessage(successMessage);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setPending(null);
    }
  }

  const handleBanToggle = () => {
    const action = state.banned ? 'unban' : 'ban';
    mutate(
      `/api/admin/users/${userId}/ban`,
      { action },
      state.banned ? 'User unbanned' : 'User banned',
      () => setState((prev) => ({ ...prev, banned: !prev.banned })),
    );
  };

  const handleRoleChange = (role: RoleOption) => {
    if (role === state.role) return;
    mutate(
      `/api/admin/users/${userId}/role`,
      { role },
      role === 'admin' ? 'Promoted to admin' : 'Downgraded to member',
      () => setState((prev) => ({ ...prev, role })),
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-white/10"
      >
        Manage
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-6 text-left shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Moderation</p>
                <h3 className="mt-2 text-xl font-semibold text-white">{displayName}</h3>
                <p className="text-sm text-slate-400">{email}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300 hover:bg-white/10"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="text-slate-300">Account status</p>
                  <p className={`text-sm font-semibold ${state.banned ? 'text-rose-300' : 'text-emerald-300'}`}>
                    {state.banned ? 'Banned' : 'Active'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={handleBanToggle}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    state.banned
                      ? 'border border-emerald-400/50 text-emerald-200 hover:bg-emerald-400/10'
                      : 'border border-rose-400/50 text-rose-200 hover:bg-rose-400/10'
                  } ${pending ? 'opacity-60' : ''}`}
                >
                  {state.banned ? 'Unban user' : 'Ban user'}
                </button>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-slate-300">Role</p>
                <div className="mt-3 flex gap-3">
                  {(['user', 'admin'] as RoleOption[]).map((roleOption) => (
                    <button
                      key={roleOption}
                      type="button"
                      disabled={pending !== null}
                      onClick={() => handleRoleChange(roleOption)}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                        state.role === roleOption
                          ? 'border-white bg-white text-slate-900'
                          : 'border-white/20 text-slate-300 hover:border-white/50'
                      } ${pending ? 'opacity-60' : ''}`}
                    >
                      {roleOption === 'admin' ? 'Admin' : 'Member'}
                    </button>
                  ))}
                </div>
              </div>

              {(message || error) && (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    error ? 'border-rose-400/60 text-rose-200' : 'border-emerald-400/60 text-emerald-200'
                  }`}
                >
                  {error ?? message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
