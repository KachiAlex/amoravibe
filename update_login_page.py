from pathlib import Path

content = """import { redirect } from 'next/navigation';

type SearchParams = Record<string, string | string[] | undefined>;

interface LoginPageProps {
  searchParams?: SearchParams | Promise<SearchParams>;
}

const isPromise = <T>(value: unknown): value is Promise<T> => {
  return !!value && typeof (value as Promise<T>).then === 'function';
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolved = searchParams
    ? isPromise<SearchParams>(searchParams)
      ? await searchParams
      : searchParams
    : {};

  const nextParam = resolved?.next;
  const nextValue = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  const params = new URLSearchParams({ openSignIn: '1' });
  if (nextValue) {
    params.set('next', nextValue);
  }

  redirect(`/?${params.toString()}`);
}
"""

Path(r'd:/amoravibe/apps/web/src/app/login/page.tsx').write_text(content)
"}
