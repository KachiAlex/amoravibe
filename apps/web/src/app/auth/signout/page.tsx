"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
export const dynamic = 'force-dynamic';

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    signOut({ redirect: false }).then(() => {
      router.push("/auth/signin");
    });
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-black px-4">
      <div className="text-white text-xl">Signing you out...</div>
    </div>
  );
}
