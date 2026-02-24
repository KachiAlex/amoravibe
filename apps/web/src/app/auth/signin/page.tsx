"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/?openSignIn=1');
  }, [router]);

  return null;
}
