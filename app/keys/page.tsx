import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ApiKeysManager } from "@/components/ApiKeysManager";

export const metadata: Metadata = { title: "API Keys — SeeFood™" };
export const dynamic = "force-dynamic";

export default async function KeysPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/keys");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        API Keys
      </h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {user.email}. Keys authorize programmatic access to the
        classification API.
      </p>
      <div className="mt-8">
        <ApiKeysManager />
      </div>
    </div>
  );
}
