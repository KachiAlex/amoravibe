import React from 'react';

export default function DevToolsPage() {
  const setAdmin = async () => {
    const r = await fetch('/api/dev/set-admin-session', { method: 'POST' }).then((r) => r.json());
    alert(JSON.stringify(r));
    if (r.ok) window.location.href = '/admin';
  };
  const clear = async () => {
    const r = await fetch('/api/dev/clear-session', { method: 'POST' }).then((r) => r.json());
    alert(JSON.stringify(r));
  };

  return (
    <main className="prose p-8">
      <h1>Dev tools</h1>
      <p>This page is development-only and will not function in production.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={setAdmin} className="btn-primary">Set admin session (login as admin)</button>
        <button onClick={clear} className="btn-ghost">Clear session</button>
        <a href="/admin" className="btn">Open Admin Dashboard</a>
      </div>
      <hr />
      <p>
        If you have <code>TRUST_API_MOCK=1</code> enabled, the admin endpoints will be served
        from the local mock store.
      </p>
    </main>
  );
}

// Prevent this page from being visible outside of development + mock mode.
export async function getServerSideProps() {
  if (process.env.NODE_ENV !== 'development' || process.env.TRUST_API_MOCK !== '1') {
    return { notFound: true };
  }
  return { props: {} };
}
