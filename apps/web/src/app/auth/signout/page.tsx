"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    // Clear auth token cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Redirect to home
    setTimeout(() => {
      router.push("/");
    }, 500);
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black px-4">
      <div className="text-white text-xl">Signing you out...</div>
    </div>
  );
}
