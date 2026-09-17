"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** NextAuth sign-in page — AuthGate on `/` already handles login UI. */
export default function AuthPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/");
  }, [router]);
  return null;
}
