"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="ml-2 rounded-md border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background"
    >
      Sign out
    </button>
  );
}
