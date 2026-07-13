import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard — SeeFood™",
  description: "Classification audit log and operational metrics.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login?next=/dashboard");
  return <Dashboard />;
}
